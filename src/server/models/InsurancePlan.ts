import mongoose from "mongoose";
import { fileSchema } from "./common";

const coveredPersonSchema = new mongoose.Schema({
  id: String,
  name: String,
  dateOfBirth: String,
  relationship: {
    type: String,
    enum: ["Self", "Spouse", "Child", "Dependent", "Other"],
  },
});

// Using 'as any' to avoid TS2590 complex union type error with Mongoose on Vercel's TypeScript 4.9
const insurancePlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  insuranceCompany: String,
  planName: String,
  policyNumber: String,
  policyType: { type: String, enum: ["comprehensive", "supplementary"] },
  policyFiles: [fileSchema],
  coveredIndividuals: [coveredPersonSchema],
  dateAdded: String,
} as any);

export const InsurancePlanModel = mongoose.model(
  "InsurancePlan",
  insurancePlanSchema
);

