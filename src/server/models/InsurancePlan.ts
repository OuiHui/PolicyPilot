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

const insurancePlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true }, // Link to User
  insuranceCompany: String,
  planName: String,
  policyNumber: String,
  groupNumber: String,
  policyType: { type: String, enum: ["comprehensive", "supplementary"] },
  policyFiles: [fileSchema],
  coveredIndividuals: [coveredPersonSchema],
  dateAdded: String,
});

export const InsurancePlanModel = mongoose.model(
  "InsurancePlan",
  insurancePlanSchema
);
