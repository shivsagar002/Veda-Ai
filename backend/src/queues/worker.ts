import { Worker, Job } from 'bullmq';
import path from 'path';
import { connectionOpts } from '../config/redis';
import Assignment from '../models/Assignment';
import { generateAssessmentAI } from '../services/ai.service';
import { generateAssignmentPDF } from '../services/pdf.service';
import { emitAssignmentProgress } from '../config/socket';

// Initialize BullMQ Workers
export const initWorkers = () => {
  // 1. Worker for generating the question paper using AI
  const generationWorker = new Worker(
    'assignment-generation',
    async (job: Job) => {
      const { assignmentId } = job.data;
      console.log(`Processing assignment generation job: ${job.id} for ID: ${assignmentId}`);

      try {
        // Step 1: Update status to GENERATING
        emitAssignmentProgress(assignmentId, 'progress', {
          step: 1,
          totalSteps: 4,
          message: 'Connecting to worker & loading parameters...',
        });

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
          throw new Error(`Assignment with ID ${assignmentId} not found in database.`);
        }

        assignment.status = 'GENERATING';
        await assignment.save();

        // Step 2: Formulating AI prompts and triggering analysis
        emitAssignmentProgress(assignmentId, 'progress', {
          step: 2,
          totalSteps: 4,
          message: 'Formulating prompts and generating questions via AI...',
        });

        const generatedPaper = await generateAssessmentAI(
          assignment.subject || 'General Science',
          assignment.className || '',
          assignment.questionTypes,
          assignment.additionalInstructions || '',
          assignment.fileBase64,
          assignment.fileMimeType
        );

        // Step 3: Parsing structure and formatting fields
        emitAssignmentProgress(assignmentId, 'progress', {
          step: 3,
          totalSteps: 4,
          message: 'Structuring question sections & balancing difficulty parameters...',
        });

        // Step 4: Storing generated paper and compiling
        emitAssignmentProgress(assignmentId, 'progress', {
          step: 4,
          totalSteps: 4,
          message: 'Saving assignment sheet database records...',
        });

        assignment.generatedPaper = generatedPaper;
        assignment.status = 'COMPLETED';
        await assignment.save();

        console.log(`Job completed successfully for Assignment: ${assignmentId}`);
        
        emitAssignmentProgress(assignmentId, 'completed', {
          assignment,
        });

        return { success: true, assignmentId };

      } catch (error: any) {
        console.error(`Error in generation worker for Job ${job.id}:`, error);
        
        // Update DB status to FAILED
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: 'FAILED',
          error: error.message || 'Unknown generation error occurred.',
        });

        emitAssignmentProgress(assignmentId, 'failed', {
          error: error.message || 'Unknown generation error occurred.',
        });

        throw error;
      }
    },
    { connection: connectionOpts }
  );

  // 2. Worker for printing school-grade PDF sheets programmatically
  const pdfWorker = new Worker(
    'pdf-generation',
    async (job: Job) => {
      const { assignmentId } = job.data;
      console.log(`Processing PDF compilation job: ${job.id} for ID: ${assignmentId}`);

      try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment || !assignment.generatedPaper) {
          throw new Error('Assignment or its generated question paper details do not exist.');
        }

        const fileName = `assignment_${assignmentId}_${Date.now()}.pdf`;
        const localPath = path.join(__dirname, '..', '..', 'public', 'pdfs', fileName);

        // Trigger PDF Kit programmatic compiler
        await generateAssignmentPDF(assignment.generatedPaper, localPath);

        // Save PDF static URL to MongoDB
        const pdfUrl = `/public/pdfs/${fileName}`;
        assignment.pdfUrl = pdfUrl;
        await assignment.save();

        console.log(`PDF created successfully: ${pdfUrl}`);

        emitAssignmentProgress(assignmentId, 'progress', {
          pdfUrl,
          message: 'PDF compiled successfully! Preparing download...',
        });

        return { pdfUrl };

      } catch (error: any) {
        console.error(`Error in PDF worker for Job ${job.id}:`, error);
        throw error;
      }
    },
    { connection: connectionOpts }
  );

  generationWorker.on('failed', (job, err) => {
    console.error(`Generation Worker Job ${job?.id} failed:`, err);
  });

  generationWorker.on('error', (err) => {
    console.error('Generation Worker connection error (Redis may be offline):', err);
  });

  pdfWorker.on('failed', (job, err) => {
    console.error(`PDF Worker Job ${job?.id} failed:`, err);
  });

  pdfWorker.on('error', (err) => {
    console.error('PDF Worker connection error (Redis may be offline):', err);
  });

  console.log('BullMQ Workers initialized successfully.');
};
