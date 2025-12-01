import mongoose from "mongoose";
import { fileSchema } from "./common";

const emailMessageSchema = new mongoose.Schema({
  id: String,
  from: String,
  to: String,
  subject: String,
  body: String,
  date: String,
  type: { type: String, enum: ["sent", "received"] },
});

const parsedDataSchema = new mongoose.Schema({
  insurer: String,
  policyNumber: String,
  denialReason: String,
});

const caseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true }, // Link to User
  planId: String,
  coveredPersonId: String,
  denialReasonTitle: String,
  dateCreated: String,
  status: {
    type: String,
    enum: [
      "uploading",
      "analyzing",
      "ready-to-send",
      "sent",
      "awaiting-reply",
      "reply-received",
    ],
  },
  currentStep: {
    type: String,
    enum: [
      "denial-upload",
      "denial-extracted-info",
      "strategy",
      "email-review",
      "email-sent",
      "reply-received",
      "followup-review",
    ],
  },
  hasNewEmail: Boolean,
  denialFiles: [fileSchema],
  parsedData: parsedDataSchema,
  analysis: {
    analysis: String,
    terms: [{ term: String, definition: String }],
    contextUsed: [String],
  },
  emailDraft: {
    subject: String,
    body: String,
  },
  emailThread: [emailMessageSchema],
  resolved: Boolean,
  resolvedDate: String,
  feedback: String,
});

export const CaseModel = mongoose.model("Case", caseSchema);
