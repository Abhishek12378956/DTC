import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import trainingRoutes from './routes/training.routes';
import assignmentRoutes from './routes/assignment.routes';
import assignmentRecipientRoutes from './routes/assignment-recipients.routes';
import reportRoutes from './routes/report.routes';
import ksaRoutes from './routes/ksa.routes';
import dmtRoutes from './routes/dmt.routes';
import departmentRoutes from './routes/department.routes';
import { CategoryRoutes } from './routes/category.routes';
import { TrainerRoutes } from './routes/trainer.routes';
import { VenueRoutes } from './routes/venue.routes';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL,
  'https://your-training-system.com'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/assignment-recipients', assignmentRecipientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ksa', ksaRoutes);
app.use('/api/dmt', dmtRoutes);
app.use('/api/departments', departmentRoutes);

// Register category routes
CategoryRoutes.registerRoutes(app);

// Register trainer routes
TrainerRoutes.registerRoutes(app);

// Register venue routes
VenueRoutes.registerRoutes(app);

// Serve static files from the React frontend app
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res, next) => {
  // If it's an API call that wasn't matched above, let it fall through to 404
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

