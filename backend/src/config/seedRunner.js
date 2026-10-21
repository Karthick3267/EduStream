require('dotenv').config();
const { connectDB, disconnectDB } = require('./db');

(async () => {
  try {
    await connectDB();
    console.log('Seed runner completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed runner failed:', err);
    process.exit(1);
  }
})();
