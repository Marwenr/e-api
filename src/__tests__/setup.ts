import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set default test environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

// Test database connection
const TEST_MONGO_URI = process.env.TEST_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017';
const TEST_DB_NAME = process.env.MONGO_DB_NAME || 'ecommerce_test';

beforeAll(async () => {
  // Connect to test database
  try {
    await mongoose.connect(TEST_MONGO_URI, {
      dbName: TEST_DB_NAME,
    });
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clean up database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch (error) {
      // Ignore errors if collection doesn't exist
    }
  }
});

