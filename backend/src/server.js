require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const ragService = require('./services/ragService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ragService.initialize();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`  EduStream - Scholarship Disbursement Platform API  `);
      console.log(`  Server running on port: ${PORT}                `);
      console.log(`  Healthcheck: http://localhost:${PORT}/api/health `);
      console.log('====================================================');
    });

    const gracefulShutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Server and database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
