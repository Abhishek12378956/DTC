import app from './app';
import getPool, { closePool } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await getPool();
    console.log('Database connection established');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await closePool();
  process.exit(0);
});
