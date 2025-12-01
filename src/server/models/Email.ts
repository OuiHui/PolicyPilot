import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  threadId: { type: String, required: true },
  messageIdHeader: { type: String }, // RFC 2822 Message-ID header
  from: { type: String, required: true },
  to: { type: String, required: true },
  subject: { type: String },
  body: { type: String }, // Plain text body
  snippet: { type: String },
  labelIds: [{ type: String }],
  internalDate: { type: Date, required: true },
  caseId: { type: String, ref: 'Case' }, // Link to a case if applicable
  analysis: {
    summary: { type: String },
    weaknesses: [{ type: String }],
    terms: [{
      term: { type: String },
      definition: { type: String }
    }],
    actionItems: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
});

export const Email = mongoose.model('Email', emailSchema);
