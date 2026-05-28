import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import Assignment from '../models/Assignment';
import { assignmentQueue, pdfQueue } from '../queues/queue';
import { generateAssessmentAI } from '../services/ai.service';
import { generateAssignmentPDF } from '../services/pdf.service';
import { emitAssignmentProgress } from '../config/socket';
import { isRedisOnline } from '../config/redis';

const router = Router();

// Local in-memory fallback database for standalone/degraded environment operations (when MongoDB is offline)
const inMemoryAssignments: any[] = [];

// Helper to dynamically build high-fidelity mock assignments when offline fallback database is cleared/reloaded
const createMockAssignment = (id: string): any => {
  return {
    _id: id,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    additionalInstructions: 'Subject: CBSE Grade 8 Science. Topic: NCERT Chapters.',
    sourceText: 'Physics & Chemistry fundamentals.',
    questionTypes: [
      { type: 'Multiple Choice Questions', count: 4, marks: 1 },
      { type: 'Short Questions', count: 3, marks: 2 },
      { type: 'Diagram/Graph-Based Questions', count: 2, marks: 5 },
      { type: 'Numerical Problems', count: 2, marks: 5 },
    ],
    totalQuestions: 11,
    totalMarks: 20,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    generatedPaper: {
      title: 'CBSE Grade 8 Science Chapter Test',
      subject: 'Science',
      totalMarks: 20,
      duration: '45 minutes',
      instructions: ['All questions are compulsory.', 'Read instructions carefully.'],
      sections: [
        {
          id: 'sec_1',
          title: 'Section A: Multiple Choice Questions',
          instruction: 'Choose the correct option.',
          questions: [
            { text: 'Which of the following is a non-metal that remains liquid at room temperature?', type: 'MCQ', options: ['Phosphorous', 'Bromine', 'Chlorine', 'Helium'], correctAnswer: '(b) Bromine', difficulty: 'Easy', marks: 1 },
            { text: 'The process of conversion of sugar into alcohol is called:', type: 'MCQ', options: ['Nitrogen fixation', 'Moulding', 'Fermentation', 'Infection'], correctAnswer: '(c) Fermentation', difficulty: 'Easy', marks: 1 },
            { text: 'Which of the following exhibits the property of malleability?', type: 'MCQ', options: ['Oxygen', 'Sulphur', 'Iron', 'Carbon'], correctAnswer: '(c) Iron', difficulty: 'Easy', marks: 1 },
            { text: 'Sound cannot travel through which of the following media?', type: 'MCQ', options: ['Water', 'Air', 'Steel', 'Vacuum'], correctAnswer: '(d) Vacuum', difficulty: 'Moderate', marks: 1 },
          ]
        },
        {
          id: 'sec_2',
          title: 'Section B: Short Answer Questions',
          instruction: 'Answer in 20-30 words.',
          questions: [
            { text: 'Explain why thermoplastic plastics cannot be reused or remoulded after heating.', type: 'Short', difficulty: 'Moderate', marks: 2 },
            { text: 'What is the function of yeast in the baking industry? Explain the chemical reaction involved.', type: 'Short', difficulty: 'Moderate', marks: 2 },
            { text: 'State two differences between contact and non-contact forces with appropriate real-world examples.', type: 'Short', difficulty: 'Easy', marks: 2 },
          ]
        },
        {
          id: 'sec_3',
          title: 'Section C: Diagram & Numerical Questions',
          instruction: 'Solve the following problems showing all steps.',
          questions: [
            { text: 'A force of 200 N is applied over an area of 4 square meters. Calculate the pressure exerted.', type: 'Numerical', difficulty: 'Hard', marks: 5 },
            { text: 'Draw a neat labeled diagram of the human eye showing the iris, pupil, lens, retina, and optic nerve.', type: 'Diagram', difficulty: 'Hard', marks: 5 },
          ]
        }
      ]
    }
  };
};

// 1. GET /api/assignments: Retrieve all assignments (Dashboard list)
router.get('/', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB offline. Retrieving assignments from in-memory fallback store...');
      const sortedList = [...inMemoryAssignments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return res.status(200).json(sortedList);
    }

    const list = await Assignment.find().sort({ createdAt: -1 });
    return res.status(200).json(list);
  } catch (error: any) {
    console.error('Failed fetching assignments:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 2. GET /api/assignments/:id: Fetch specific assignment detail & state
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let item = inMemoryAssignments.find(a => a._id === req.params.id);
      if (!item) {
        console.log(`Assignment ${req.params.id} not found in fallback store. Creating mock on-the-fly...`);
        item = createMockAssignment(req.params.id);
        inMemoryAssignments.push(item);
      }
      return res.status(200).json(item);
    }

    const item = await Assignment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }
    return res.status(200).json(item);
  } catch (error: any) {
    console.error('Failed fetching assignment by ID:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 3. POST /api/assignments: Validate fields, create DB entry, queue AI Job
router.post('/', async (req: Request, res: Response) => {
  try {
    const { dueDate, additionalInstructions, questionTypes, sourceText, subject, className, fileBase64, fileMimeType, fileName } = req.body;

    // --- FORM VALIDATION ---
    if (!dueDate || !dueDate.trim()) {
      return res.status(400).json({ error: 'Due Date is required.' });
    }

    if (!questionTypes || !Array.isArray(questionTypes) || questionTypes.length === 0) {
      return res.status(400).json({ error: 'At least one Question Type configuration is required.' });
    }

    let calculatedQuestions = 0;
    let calculatedMarks = 0;

    for (const q of questionTypes) {
      if (!q.type || !q.type.trim()) {
        return res.status(400).json({ error: 'Each question configuration must contain a valid type.' });
      }
      
      const count = Number(q.count);
      const marks = Number(q.marks);

      if (isNaN(count) || count <= 0 || !Number.isInteger(count)) {
        return res.status(400).json({ error: `Question count for type "${q.type}" must be a positive integer.` });
      }

      if (isNaN(marks) || marks <= 0) {
        return res.status(400).json({ error: `Question marks for type "${q.type}" must be a positive number.` });
      }

      calculatedQuestions += count;
      calculatedMarks += count * marks;
    }

    // --- IN-MEMORY GRACEFUL FALLBACK ---
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB offline. Creating assignment record in in-memory fallback store...');
      
      const mockId = new mongoose.Types.ObjectId().toString();
      const newAssignment = {
        _id: mockId,
        dueDate,
        subject: subject || '',
        className: className || '',
        additionalInstructions: additionalInstructions || '',
        sourceText: sourceText || '',
        questionTypes,
        totalQuestions: calculatedQuestions,
        totalMarks: calculatedMarks,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      inMemoryAssignments.push(newAssignment);

      // Spin up automated generation simulation via WebSockets
      (async () => {
        try {
          // Delay Helper
          const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

          // Step 1: Connecting
          await sleep(500);
          newAssignment.status = 'GENERATING';
          emitAssignmentProgress(mockId, 'progress', {
            step: 1,
            totalSteps: 4,
            message: 'Connecting to worker & loading parameters...',
          });

          // Step 2: Formulating
          await sleep(1000);
          emitAssignmentProgress(mockId, 'progress', {
            step: 2,
            totalSteps: 4,
            message: 'Formulating prompts and generating questions via AI...',
          });

          const resolvedSubject = subject || additionalInstructions?.match(/subject:\s*([a-zA-Z0-9\s]+)/i)?.[1] 
            || 'General Science';
          
          const generatedPaper = await generateAssessmentAI(
            resolvedSubject,
            className || '',
            questionTypes,
            additionalInstructions,
            fileBase64,
            fileMimeType
          );

          // Step 3: Structuring
          await sleep(1000);
          emitAssignmentProgress(mockId, 'progress', {
            step: 3,
            totalSteps: 4,
            message: 'Structuring question sections & balancing difficulty parameters...',
          });

          // Step 4: Saving
          await sleep(1000);
          emitAssignmentProgress(mockId, 'progress', {
            step: 4,
            totalSteps: 4,
            message: 'Saving assignment sheet database records...',
          });

          newAssignment.generatedPaper = generatedPaper;
          newAssignment.status = 'COMPLETED';

          console.log(`Fallback simulation: Job completed successfully for Assignment ID ${mockId}`);
          
          await sleep(500);
          emitAssignmentProgress(mockId, 'completed', {
            assignment: newAssignment,
          });

        } catch (simError: any) {
          console.error('Fallback generation simulation failed:', simError);
          newAssignment.status = 'FAILED';
          newAssignment.error = simError.message || 'Simulation generation failed.';
          emitAssignmentProgress(mockId, 'failed', {
            error: simError.message || 'Simulation generation failed.',
          });
        }
      })();

      return res.status(201).json(newAssignment);
    }

    // --- STANDARD MONGOOSE / BULLMQ PIPELINE ---
    const newAssignment = new Assignment({
      dueDate,
      subject: subject || '',
      className: className || '',
      additionalInstructions: additionalInstructions || '',
      sourceText: sourceText || '',
      fileBase64: fileBase64 || '',
      fileMimeType: fileMimeType || '',
      fileName: fileName || '',
      questionTypes,
      totalQuestions: calculatedQuestions,
      totalMarks: calculatedMarks,
      status: 'PENDING',
    });

    const savedAssignment = await newAssignment.save();

    // Trigger BullMQ Background job if Redis is online, otherwise run local synchronous fallback directly
    const runSynchronously = () => {
      // Standalone synchronous fallback for MongoDB but missing Redis
      (async () => {
        try {
          const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
          
          await sleep(200);
          savedAssignment.status = 'GENERATING';
          await savedAssignment.save();
          emitAssignmentProgress(savedAssignment._id.toString(), 'progress', {
            step: 1,
            totalSteps: 4,
            message: 'Running local generation stream...',
          });

          const resolvedSubject = subject || additionalInstructions?.match(/subject:\s*([a-zA-Z0-9\s]+)/i)?.[1] 
            || 'General Science';

          const generatedPaper = await generateAssessmentAI(
            resolvedSubject,
            className || '',
            questionTypes,
            additionalInstructions,
            fileBase64,
            fileMimeType
          );

          savedAssignment.generatedPaper = generatedPaper;
          savedAssignment.status = 'COMPLETED';
          await savedAssignment.save();

          emitAssignmentProgress(savedAssignment._id.toString(), 'completed', {
            assignment: savedAssignment,
          });
        } catch (localGenErr: any) {
          console.error('Local direct generation failed:', localGenErr);
          savedAssignment.status = 'FAILED';
          savedAssignment.error = localGenErr.message;
          await savedAssignment.save();
          emitAssignmentProgress(savedAssignment._id.toString(), 'failed', {
            error: localGenErr.message,
          });
        }
      })();
    };

    if (isRedisOnline) {
      try {
        const job = await assignmentQueue.add('generate-paper', {
          assignmentId: savedAssignment._id,
        });
        console.log(`Successfully queued generation job ${job.id} for Assignment ${savedAssignment._id}`);
      } catch (redisError: any) {
        console.warn('Redis failed queueing job. Running worker logic synchronously...', redisError);
        runSynchronously();
      }
    } else {
      console.warn('Redis is offline. Running worker logic synchronously...');
      runSynchronously();
    }

    return res.status(201).json(savedAssignment);

  } catch (error: any) {
    console.error('Failed creating assignment:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 4. POST /api/assignments/:id/pdf: Trigger programmatic PDF rendering job
router.post('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.id;

    // --- IN-MEMORY GRACEFUL FALLBACK ---
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB offline. Rendering PDF via in-memory fallback path...');
      
      let item = inMemoryAssignments.find(a => a._id === assignmentId);
      if (!item) {
        console.log(`Assignment ${assignmentId} not found in fallback store. Creating mock on-the-fly to compile PDF...`);
        item = createMockAssignment(assignmentId);
        inMemoryAssignments.push(item);
      }

      if (item.status !== 'COMPLETED' || !item.generatedPaper) {
        return res.status(400).json({ error: 'Question paper must be generated before compiling PDF.' });
      }

      const fileName = `assignment_mock_${assignmentId}_${Date.now()}.pdf`;
      const pdfsDir = path.join(__dirname, '..', '..', 'public', 'pdfs');
      
      // Ensure target directory exists
      if (!fs.existsSync(pdfsDir)) {
        fs.mkdirSync(pdfsDir, { recursive: true });
      }
      
      const localPath = path.join(pdfsDir, fileName);

      // Generate PDF Kit programmatically directly in route
      await generateAssignmentPDF(item.generatedPaper, localPath);

      const pdfUrl = `/public/pdfs/${fileName}`;
      item.pdfUrl = pdfUrl;

      // Notify progress successfully
      emitAssignmentProgress(assignmentId, 'progress', {
        pdfUrl,
        message: 'PDF compiled successfully! Preparing download...',
      });

      return res.status(200).json({ message: 'PDF generated successfully via fallback.', pdfUrl });
    }

    // --- STANDARD MONGOOSE / BULLMQ PIPELINE ---
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    if (assignment.status !== 'COMPLETED' || !assignment.generatedPaper) {
      return res.status(400).json({ error: 'Assignment question paper must be generated before compiling PDF.' });
    }

    // Trigger BullMQ PDF job if Redis is online, otherwise run local synchronous fallback directly
    const runPdfSynchronously = async () => {
      // Direct PDF drawing when Redis is missing but Mongo exists
      const fileName = `assignment_${assignmentId}_${Date.now()}.pdf`;
      const pdfsDir = path.join(__dirname, '..', '..', 'public', 'pdfs');
      
      if (!fs.existsSync(pdfsDir)) {
        fs.mkdirSync(pdfsDir, { recursive: true });
      }

      const localPath = path.join(pdfsDir, fileName);
      await generateAssignmentPDF(assignment.generatedPaper, localPath);

      const pdfUrl = `/public/pdfs/${fileName}`;
      assignment.pdfUrl = pdfUrl;
      await assignment.save();

      emitAssignmentProgress(assignmentId, 'progress', {
        pdfUrl,
        message: 'PDF compiled successfully!',
      });
    };

    if (isRedisOnline) {
      try {
        const job = await pdfQueue.add('render-pdf', {
          assignmentId,
        });
        console.log(`Successfully queued PDF generation job ${job.id} for Assignment ${assignmentId}`);
      } catch (redisError: any) {
        console.warn('Redis failed queueing PDF. Running PDF generation synchronously...', redisError);
        await runPdfSynchronously();
      }
    } else {
      console.warn('Redis offline. Running PDF generation synchronously...');
      await runPdfSynchronously();
    }

    return res.status(200).json({ message: 'PDF generation processed.' });

  } catch (error: any) {
    console.error('Failed queuing PDF job:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 6. POST /api/assignments/:id/regenerate: Re-trigger AI generation to replace questions
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.id;

    // --- IN-MEMORY GRACEFUL FALLBACK ---
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB offline. Regenerating assignment in in-memory fallback store...');
      
      let item = inMemoryAssignments.find(a => a._id === assignmentId);
      if (!item) {
        console.log(`Assignment ${assignmentId} not found in fallback store. Creating mock on-the-fly to regenerate...`);
        item = createMockAssignment(assignmentId);
        inMemoryAssignments.push(item);
      }

      item.status = 'PENDING';
      item.generatedPaper = undefined;
      item.pdfUrl = undefined;

      // Spin up automated generation simulation via WebSockets
      (async () => {
        try {
          const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

          await sleep(500);
          item.status = 'GENERATING';
          emitAssignmentProgress(assignmentId, 'progress', {
            step: 1,
            totalSteps: 4,
            message: 'Re-connecting to worker & loading parameters...',
          });

          await sleep(1000);
          emitAssignmentProgress(assignmentId, 'progress', {
            step: 2,
            totalSteps: 4,
            message: 'Regenerating questions via Gemini AI...',
          });

          const regenSubject = item.subject || item.additionalInstructions?.match(/subject:\s*([a-zA-Z0-9\s]+)/i)?.[1] 
            || 'General Science';
          
          const generatedPaper = await generateAssessmentAI(
            regenSubject,
            item.className || '',
            item.questionTypes,
            item.additionalInstructions
          );

          await sleep(1000);
          emitAssignmentProgress(assignmentId, 'progress', {
            step: 3,
            totalSteps: 4,
            message: 'Re-structuring questions & difficulty parameters...',
          });

          await sleep(1000);
          emitAssignmentProgress(assignmentId, 'progress', {
            step: 4,
            totalSteps: 4,
            message: 'Replacing questions in database...',
          });

          item.generatedPaper = generatedPaper;
          item.status = 'COMPLETED';

          console.log(`Fallback simulation: Job regenerated successfully for Assignment ID ${assignmentId}`);
          
          await sleep(500);
          emitAssignmentProgress(assignmentId, 'completed', {
            assignment: item,
          });

        } catch (simError: any) {
          console.error('Fallback generation simulation failed:', simError);
          item.status = 'FAILED';
          item.error = simError.message || 'Simulation generation failed.';
          emitAssignmentProgress(assignmentId, 'failed', {
            error: simError.message || 'Simulation generation failed.',
          });
        }
      })();

      return res.status(200).json(item);
    }

    // --- STANDARD MONGOOSE / BULLMQ PIPELINE ---
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    // Reset status and clear old generated details
    assignment.status = 'PENDING';
    assignment.generatedPaper = undefined;
    assignment.pdfUrl = undefined;
    await assignment.save();

    // Trigger BullMQ Background job if Redis is online, otherwise run local synchronous fallback directly
    const runRegenSynchronously = () => {
      // Standalone synchronous fallback for MongoDB but missing Redis
      (async () => {
        try {
          const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
          
          await sleep(200);
          assignment.status = 'GENERATING';
          await assignment.save();
          emitAssignmentProgress(assignmentId, 'progress', {
            step: 1,
            totalSteps: 4,
            message: 'Running local generation stream...',
          });

          const regenSubject = assignment.subject || 'General Science';

          const generatedPaper = await generateAssessmentAI(
            regenSubject,
            assignment.className || '',
            assignment.questionTypes,
            assignment.additionalInstructions || '',
            assignment.fileBase64,
            assignment.fileMimeType
          );

          assignment.generatedPaper = generatedPaper;
          assignment.status = 'COMPLETED';
          await assignment.save();

          emitAssignmentProgress(assignmentId, 'completed', {
            assignment,
          });
        } catch (localGenErr: any) {
          console.error('Local direct regeneration failed:', localGenErr);
          assignment.status = 'FAILED';
          assignment.error = localGenErr.message;
          await assignment.save();
          emitAssignmentProgress(assignmentId, 'failed', {
            error: localGenErr.message,
          });
        }
      })();
    };

    if (isRedisOnline) {
      try {
        const job = await assignmentQueue.add('generate-paper', {
          assignmentId: assignment._id,
        });
        console.log(`Successfully queued regeneration job ${job.id} for Assignment ${assignment._id}`);
      } catch (redisError: any) {
        console.warn('Redis failed queueing regeneration job. Running worker logic synchronously...', redisError);
        runRegenSynchronously();
      }
    } else {
      console.warn('Redis is offline. Running worker logic synchronously...');
      runRegenSynchronously();
    }

    return res.status(200).json(assignment);

  } catch (error: any) {
    console.error('Failed regenerating assignment:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 5. DELETE /api/assignments/:id: Remove an assignment from records
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const idx = inMemoryAssignments.findIndex(a => a._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Assignment not found in fallback store.' });
      }
      inMemoryAssignments.splice(idx, 1);
      return res.status(200).json({ message: 'Assignment successfully deleted from fallback store.' });
    }

    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }
    return res.status(200).json({ message: 'Assignment successfully deleted.' });
  } catch (error: any) {
    console.error('Failed deleting assignment:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
