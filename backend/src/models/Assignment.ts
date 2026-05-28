import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  type: string; // 'MCQ' | 'Short' | 'Diagram' | 'Numerical'
  options?: string[]; // Only for MCQ
  correctAnswer?: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface ISection {
  id: string; // 'A', 'B', 'C', etc.
  title: string; // e.g. 'Section A - Multiple Choice Questions'
  instruction: string; // e.g. 'Answer all questions.'
  questions: IQuestion[];
}

export interface IGeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  instructions: string[];
  sections: ISection[];
}

export interface IQuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  type: { type: String, required: true },
  options: { type: [String], default: undefined },
  correctAnswer: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true },
});

const SectionSchema = new Schema<ISection>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
});

const GeneratedPaperSchema = new Schema<IGeneratedPaper>({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  duration: { type: String, required: true },
  instructions: { type: [String], default: [] },
  sections: [SectionSchema],
});

const QuestionTypeConfigSchema = new Schema<IQuestionTypeConfig>({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marks: { type: Number, required: true },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    dueDate: { type: String, required: true },
    subject: { type: String },
    className: { type: String },
    additionalInstructions: { type: String },
    sourceText: { type: String },
    fileBase64: { type: String },
    fileMimeType: { type: String },
    fileName: { type: String },
    questionTypes: [QuestionTypeConfigSchema],
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    error: { type: String },
    pdfUrl: { type: String },
    generatedPaper: { type: GeneratedPaperSchema },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
