import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/policypilot";

// Log for debugging - show first 50 chars only (hide password)
const uriPreview = MONGODB_URI.substring(0, 50) + "...";
console.log("MONGODB_URI preview:", uriPreview);
console.log("MONGODB_URI is set:", !!process.env.MONGODB_URI);

// Cache the connection promise to prevent multiple connections in serverless env
let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async () => {
  console.log("connectDB called, readyState:", mongoose.connection.readyState);

  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("Already connected, skipping...");
      return;
    }

    if (cachedPromise) {
      console.log("Using cached connection promise...");
      await cachedPromise;
      return;
    }

    console.log("Creating new MongoDB connection...");

    // Aggressive timeouts for serverless environment
    cachedPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds to find a server
      connectTimeoutMS: 5000, // 5 seconds to establish connection
      socketTimeoutMS: 10000, // 10 seconds for socket operations
    });

    await cachedPromise;

    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log(`Connected to MongoDB - Database: ${dbName}`);
  } catch (error: any) {
    console.error("MongoDB connection FAILED:", error?.message || error);
    cachedPromise = null; // Reset cache on failure to allow retry
    throw error;
  }
};

