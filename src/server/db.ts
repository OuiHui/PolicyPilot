import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/policypilot";

// Cache the connection promise to prevent multiple connections in serverless env
let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    if (cachedPromise) {
      await cachedPromise;
      return;
    }

    cachedPromise = mongoose.connect(MONGODB_URI);
    await cachedPromise;

    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log(`Connected to MongoDB - Database: ${dbName}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Do NOT exit process in serverless environment
    // process.exit(1);
    throw error; // Re-throw so the caller knows it failed
  }
};
