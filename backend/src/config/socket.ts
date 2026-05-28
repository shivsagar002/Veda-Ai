import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer): SocketIOServer => {
  const allowedOrigin = process.env.FRONTEND_URL || process.env.ALLOWED_ORIGIN || process.env.CORS_ORIGIN || '*';
  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(','),
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join room for specific assignment generation updates
    socket.on('join-assignment', (assignmentId: string) => {
      socket.join(assignmentId);
      console.log(`Socket client ${socket.id} joined room: ${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Please run initSocket first.');
  }
  return io;
};

// Helper function to emit progress updates to a room
export const emitAssignmentProgress = (assignmentId: string, event: 'progress' | 'completed' | 'failed', data: any) => {
  if (io) {
    io.to(assignmentId).emit(`assignment-${event}`, data);
  }
};
