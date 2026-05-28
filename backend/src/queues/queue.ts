import { Queue } from 'bullmq';
import { connectionOpts } from '../config/redis';

// Queue to generate question papers via AI
export const assignmentQueue = new Queue('assignment-generation', {
  connection: connectionOpts,
});

assignmentQueue.on('error', (err) => {
  console.error('Assignment Queue connection error (Redis may be offline):', err);
});

// Queue to generate PDF sheets programmatically
export const pdfQueue = new Queue('pdf-generation', {
  connection: connectionOpts,
});

pdfQueue.on('error', (err) => {
  console.error('PDF Queue connection error (Redis may be offline):', err);
});

console.log('BullMQ Queues initialized successfully.');
