import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veda-ai';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully to', MONGO_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Allowing server to start in degraded mode without MongoDB connection...');
  }
};
