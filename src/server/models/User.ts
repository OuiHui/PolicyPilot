import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth users
  firstName: String,
  lastName: String,
  hipaaAccepted: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const UserModel = mongoose.model("User", userSchema);
