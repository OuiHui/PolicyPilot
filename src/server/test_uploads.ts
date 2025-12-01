import mongoose from "mongoose";
import { createPlan } from "./controllers/planController";
import { createCase, uploadDenialFiles } from "./controllers/caseController";
import { connectDB } from "./db";

// Mock File class for Node environment (if not available globally)
if (typeof global.File === 'undefined') {
  class MockFile {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    buffer: Buffer;

    constructor(parts: any[], name: string, options: any) {
      this.name = name;
      this.type = options.type;
      this.lastModified = Date.now();
      this.buffer = Buffer.from(parts[0]);
      this.size = this.buffer.length;
    }

    async arrayBuffer() {
      return this.buffer;
    }
  }
  (global as any).File = MockFile;
}

// Mock Hono Context
const mockContext = (body: any, params: any = {}) => {
  return {
    req: {
      json: async () => body,
      parseBody: async () => body,
      param: (key: string) => params[key],
    },
    json: (data: any, status: number = 200) => {
      return { data, status };
    },
  } as any;
};

(async () => {
  try {
    await connectDB();

    // 1. Test createPlan with files
    console.log("Testing createPlan with files...");
    const file1 = new File(["dummy content"], "policy.pdf", { type: "application/pdf" });
    const planBody = {
      id: "test-plan-" + Date.now(),
      userId: "test-user",
      insuranceCompany: "Test Insurer",
      planName: "Test Plan",
      policyNumber: "123",

      policyType: "comprehensive",
      dateAdded: new Date().toISOString(),
      "policyFiles[]": [file1],
    };
    const ctx1 = mockContext(planBody);
    const res1 = await createPlan(ctx1);
    console.log("Plan created:", res1.status);
    if (res1.status !== 201) throw new Error("Failed to create plan");
    if (res1.data.policyFiles.length !== 1) throw new Error("File not saved in plan");

    // 2. Test createCase (JSON)
    console.log("Testing createCase...");
    const caseId = "test-case-" + Date.now();
    const caseBody = {
      id: caseId,
      userId: "test-user",
      planId: planBody.id,
      coveredPersonId: "person-1",
      denialReasonTitle: "Test Denial",
      dateCreated: new Date().toISOString(),
      status: "uploading",
      currentStep: "denial-upload",
      hasNewEmail: false,
      denialFiles: [],
      parsedData: null,
      emailThread: []
    };
    const ctx2 = mockContext(caseBody);
    const res2 = await createCase(ctx2);
    console.log("Case created:", res2.status);
    if (res2.status !== 201) throw new Error("Failed to create case");

    // 3. Test uploadDenialFiles
    console.log("Testing uploadDenialFiles...");
    const file2 = new File(["denial content"], "denial.pdf", { type: "application/pdf" });
    const uploadBody = {
      "denialFiles[]": [file2],
    };
    const ctx3 = mockContext(uploadBody, { id: caseId });
    const res3 = await uploadDenialFiles(ctx3);
    console.log("Files uploaded:", res3.status);
    if (res3.status !== 200) throw new Error("Failed to upload files");
    if (res3.data.denialFiles.length !== 1) throw new Error("File not saved in case");
    if (res3.data.status !== "analyzing") throw new Error("Status not updated");

    console.log("Upload verification passed!");
  } catch (e) {
    console.error("Verification failed:", e);
  } finally {
    await mongoose.disconnect();
  }
})();
