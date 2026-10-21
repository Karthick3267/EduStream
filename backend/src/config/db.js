const mongoose = require('mongoose');
const { seedDatabase } = require('./seedData');

let mongoMemoryServer = null;

const connectDB = async () => {
  const configuredUri = process.env.MONGODB_URI;

  if (configuredUri) {
    try {
      console.log(`Attempting connection to configured MongoDB: ${configuredUri.split('@').pop()}`);
      await mongoose.connect(configuredUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log('MongoDB connected successfully to external/local instance.');
      await seedDatabase();
      return;
    } catch (err) {
      console.warn(
        `Failed to connect to configured MONGODB_URI (${err.message}). Falling back to embedded MongoMemoryServer...`
      );
    }
  }

  // Fallback: embedded zero-install MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log('Initializing embedded in-memory MongoDB engine for zero-friction local execution...');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 60000,
      },
    });
    const memoryUri = mongoMemoryServer.getUri();

    await mongoose.connect(memoryUri);
    console.log(`Connected to Embedded MongoDB at: ${memoryUri}`);

    // Seed realistic demo data
    await seedDatabase();
  } catch (memoryErr) {
    console.error('Fatal: Could not initialize embedded database engine:', memoryErr);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting from database:', err);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
