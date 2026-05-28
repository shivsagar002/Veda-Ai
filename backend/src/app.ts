import express from 'express';
import cors from 'cors';
import path from 'path';
import assignmentRoutes from './routes/assignment.routes';

const app = express();

// Middlewares
const allowedOrigin = process.env.FRONTEND_URL || process.env.ALLOWED_ORIGIN || process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(','),
  credentials: true
}));
// Increased limit to 15MB to support base64-encoded file uploads (images/PDFs) in JSON body
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Serve compiled PDFs as static assets
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Root status endpoint
app.get('/status', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'VedaAI Assessment Creator API is running smoothly.' });
});

// API Routes
app.use('/api/assignments', assignmentRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express Global Error Caught:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
