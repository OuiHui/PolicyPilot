import mongoose from "mongoose";

export const fileSchema = new mongoose.Schema({
  name: String,
  size: Number,
  type: String,
  lastModified: Number,
  data: Buffer, // Binary data (for legacy direct uploads)
  bucket: String, // Supabase bucket name
  path: String, // Supabase file path
});
