import mongoose from "mongoose";

export const fileSchema = new mongoose.Schema({
  name: String,
  size: Number,
  type: String,
  lastModified: Number,
  data: Buffer, // Binary data
});
