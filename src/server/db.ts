import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/policypilot";

// Log whether MONGODB_URI is set (for debugging Vercel)
console.log("MONGODB_URI configured:", MONGODB_URI ? "Yes" : "No (using localhost fallback)");

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

    // Add connection options for serverless environment
    cachedPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout for initial connection
      socketTimeoutMS: 10000, // 10 second timeout for operations
    });
    await cachedPromise;

    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log(`Connected to MongoDB - Database: ${dbName}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cachedPromise = null; // Reset cache on failure to allow retry
    throw error;
  }
};

