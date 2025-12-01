import mongoose from "mongoose";
import { InsurancePlanModel, CaseModel, UserModel } from "./models/index";
import { connectDB } from "./db";

(async () => {
  try {
    await connectDB();

    // Clear existing data
    await InsurancePlanModel.deleteMany({});
    await CaseModel.deleteMany({});
    await UserModel.deleteMany({});
    console.log("Cleared existing data");

    // Create Sample User
    const user = new UserModel({
      email: "user@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    });
    await user.save();
    console.log("Saved sample user");

    // Create Sample Insurance Plan
    const planId = "plan_123";
    const personId = "person_456";

    const samplePlan = new InsurancePlanModel({
      id: planId,
      userId: user._id, // Link to user
      insuranceCompany: "Blue Cross Blue Shield",
      planName: "PPO Gold 2024",
      policyNumber: "ABC123456",

      policyType: "comprehensive",
      policyFiles: [
        {
          name: "policy_doc.pdf",
          size: 1024 * 1024 * 2, // 2MB
          type: "application/pdf",
          lastModified: Date.now(),
          data: Buffer.from("dummy pdf content for policy"),
        },
      ],
      coveredIndividuals: [
        {
          id: personId,
          name: "John Doe",
          dateOfBirth: "1980-01-01",
          relationship: "Self",
        },
      ],
      dateAdded: new Date().toISOString(),
    });

    await samplePlan.save();
    console.log("Saved sample insurance plan");

    // Create Sample Case
    const sampleCase = new CaseModel({
      id: "case_789",
      userId: user._id, // Link to user
      planId: planId,
      coveredPersonId: personId,
      denialReasonTitle: "ER visit denied",
      dateCreated: new Date().toISOString(),
      status: "ready-to-send",
      currentStep: "strategy",
      hasNewEmail: false,
      denialFiles: [
        {
          name: "denial_letter.pdf",
          size: 1024 * 500, // 500KB
          type: "application/pdf",
          lastModified: Date.now(),
          data: Buffer.from("dummy pdf content for denial"),
        },
      ],
      parsedData: {
        insurer: "Blue Cross Blue Shield",
        policyNumber: "ABC123456",
        denialReason: "Not medically necessary",
      },
      emailThread: [],
    });

    await sampleCase.save();
    console.log("Saved sample case");

    console.log("Seed script completed successfully");
  } catch (e) {
    console.error("Seed script failed:", e);
  } finally {
    await mongoose.disconnect();
  }
})();
