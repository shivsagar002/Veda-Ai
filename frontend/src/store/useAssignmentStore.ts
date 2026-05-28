import { create } from 'zustand';

export interface IQuestion {
  text: string;
  type: string;
  options?: string[];
  correctAnswer?: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface ISection {
  id: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IGeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  instructions: string[];
  sections: ISection[];
  schoolHeader?: {
    board?: string;
    name?: string;
  };
}

export interface IQuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

export interface IAssignment {
  _id: string;
  dueDate: string;
  subject?: string;
  className?: string;
  additionalInstructions?: string;
  sourceText?: string;
  fileBase64?: string;
  fileMimeType?: string;
  fileName?: string;
  questionTypes: IQuestionTypeConfig[];
  totalQuestions: number;
  totalMarks: number;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  error?: string;
  pdfUrl?: string;
  generatedPaper?: IGeneratedPaper;
  createdAt: string;
}

interface AssignmentState {
  // Creation form states
  dueDate: string;
  additionalInstructions: string;
  sourceText: string;
  questionTypes: IQuestionTypeConfig[];

  // App lists & single state
  assignmentsList: IAssignment[];
  currentAssignment: IAssignment | null;

  // Real-time worker loading states
  isGenerating: boolean;
  progressStep: number;
  progressTotalSteps: number;
  progressMessage: string;

  // PDF loading states
  pdfCompiling: boolean;
  pdfUrl: string | null;
  error: string | null;

  // Actions
  setDueDate: (date: string) => void;
  setAdditionalInstructions: (text: string) => void;
  setSourceText: (text: string) => void;
  updateQuestionType: (type: string, key: 'count' | 'marks', action: 'inc' | 'dec' | number) => void;
  setAssignmentsList: (list: IAssignment[]) => void;
  setCurrentAssignment: (assignment: IAssignment | null) => void;
  startGeneration: () => void;
  setGenerationProgress: (step: number, total: number, message: string) => void;
  completeGeneration: (assignment: IAssignment) => void;
  failGeneration: (error: string) => void;
  resetProgress: () => void;
  setPDFCompiling: (compiling: boolean) => void;
  setPDFUrl: (url: string | null) => void;
  setError: (err: string | null) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  dueDate: '',
  additionalInstructions: '',
  sourceText: '',
  questionTypes: [
    { type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { type: 'Short Questions', count: 3, marks: 2 },
    { type: 'Diagram/Graph-Based Questions', count: 2, marks: 5 },
    { type: 'Numerical Problems', count: 2, marks: 5 },
  ],
  assignmentsList: [],
  currentAssignment: null,
  isGenerating: false,
  progressStep: 0,
  progressTotalSteps: 4,
  progressMessage: '',
  pdfCompiling: false,
  pdfUrl: null,
  error: null,

  setDueDate: (date) => set({ dueDate: date }),
  setAdditionalInstructions: (text) => set({ additionalInstructions: text }),
  setSourceText: (text) => set({ sourceText: text }),

  updateQuestionType: (type, key, action) =>
    set((state) => ({
      questionTypes: state.questionTypes.map((q) => {
        if (q.type !== type) return q;

        let value = q[key];
        if (action === 'inc') {
          value += 1;
        } else if (action === 'dec') {
          value = Math.max(0, value - 1);
        } else if (typeof action === 'number') {
          value = action;
        }

        return { ...q, [key]: value };
      }),
    })),

  setAssignmentsList: (list) => set({ assignmentsList: list }),
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment, error: null }),

  startGeneration: () =>
    set({
      isGenerating: true,
      progressStep: 1,
      progressMessage: 'Connecting to background worker...',
      error: null,
    }),

  setGenerationProgress: (step, total, message) =>
    set({
      progressStep: step,
      progressTotalSteps: total,
      progressMessage: message,
    }),

  completeGeneration: (assignment) =>
    set({
      currentAssignment: assignment,
      isGenerating: false,
      progressStep: 0,
      progressMessage: '',
      error: null,
    }),

  failGeneration: (error) =>
    set({
      isGenerating: false,
      progressStep: 0,
      progressMessage: '',
      error,
    }),

  resetProgress: () =>
    set({
      isGenerating: false,
      progressStep: 0,
      progressMessage: '',
      error: null,
    }),

  setPDFCompiling: (compiling) => set({ pdfCompiling: compiling }),
  setPDFUrl: (url) => set({ pdfUrl: url, pdfCompiling: false }),
  setError: (err) => set({ error: err }),
}));
