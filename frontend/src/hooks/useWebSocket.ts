import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '../store/useAssignmentStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useWebSocket = (assignmentId: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  
  const {
    setGenerationProgress,
    completeGeneration,
    failGeneration,
    setPDFUrl,
  } = useAssignmentStore();

  useEffect(() => {
    if (!assignmentId) return;

    console.log(`Connecting to WebSocket for room: ${assignmentId}`);

    // Create standard socket.io client connection
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`WebSocket connected: ${socket.id}`);
      // Join room for this specific assignment
      socket.emit('join-assignment', assignmentId);
    });

    // Handle background worker step logs
    socket.on('assignment-progress', (data: any) => {
      console.log('WS: Received assignment progress data:', data);
      
      if (data.step && data.totalSteps) {
        setGenerationProgress(data.step, data.totalSteps, data.message || 'Processing background job...');
      } else if (data.pdfUrl) {
        // PDF compiled progress
        setPDFUrl(data.pdfUrl);
      }
    });

    // Handle job completion
    socket.on('assignment-completed', (data: any) => {
      console.log('WS: Job completed data received:', data);
      if (data.assignment) {
        completeGeneration(data.assignment);
      }
    });

    // Handle job failure
    socket.on('assignment-failed', (data: any) => {
      console.log('WS: Job failed data received:', data);
      failGeneration(data.error || 'Failed to generate question paper.');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected.');
    });

    // Clean up socket listener on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [assignmentId, setGenerationProgress, completeGeneration, failGeneration, setPDFUrl]);

  return socketRef.current;
};
