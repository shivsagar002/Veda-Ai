import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './config/socket';
import { initWorkers } from './queues/worker';

dotenv.config();

// Global resilience handlers to prevent connection/asynchronous events from crashing the API server
process.on('uncaughtException', (error) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION CAUGHT BY RESILIENCY HANDLER:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL UNHANDLED REJECTION AT:', promise, 'REASON:', reason);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Mongoose DB (asynchronously to prevent port binding blockages when offline)
    connectDB().catch(dbErr => {
      console.error('Asynchronous MongoDB connection failed:', dbErr);
    });

    // 2. Create HTTP Server
    const server = http.createServer(app);

    // 3. Initialize WebSocket Server
    initSocket(server);

    // 4. Initialize BullMQ Queue Workers
    try {
      initWorkers();
    } catch (workerError) {
      console.error('Asynchronous BullMQ worker initialization failed (Redis may be offline):', workerError);
    }

    // 5. Start listening
    server.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`  VedaAI Backend Server running on port ${PORT}      `);
      console.log(`  WebSockets and BullMQ Workers loaded successfully. `);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Failed to start VedaAI Backend Server:', error);
    process.exit(1);
  }
};

startServer();
