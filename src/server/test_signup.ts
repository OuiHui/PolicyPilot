import mongoose from "mongoose";
import { createUser } from "./controllers/userController";
import { UserModel } from "./models/User";
import { connectDB } from "./db";

// Mock Hono Context
const mockContext = (body: any) => {
  return {
    req: {
      json: async () => body,
    },
    json: (data: any, status: number = 200) => {
      return { data, status };
    },
  } as any;
};

(async () => {
  try {
    await connectDB();

    const testEmail = `signup-test-${Date.now()}@example.com`;
    console.log(`Testing signup with email: ${testEmail}`);

    // 1. Test signup
    const ctx1 = mockContext({ 
        email: testEmail, 
        password: "password123",
        firstName: "Test",
        lastName: "User"
    });
    const res1 = await createUser(ctx1);
    console.log("Signup result:", res1);

    if (res1.status !== 201) throw new Error("Expected 201 for successful signup");
    if (res1.data.email !== testEmail) throw new Error("Email mismatch");

    // 2. Verify in DB
    const user = await UserModel.findOne({ email: testEmail });
    if (!user) throw new Error("User not found in DB after signup");
    console.log("User found in DB:", user.email);

    // 3. Test duplicate signup
    console.log("Testing duplicate signup...");
    const res2 = await createUser(ctx1);
    console.log("Duplicate signup result:", res2);
    if (res2.status !== 400) throw new Error("Expected 400 for duplicate signup");

    console.log("Signup verification passed!");
  } catch (e) {
    console.error("Verification failed:", e);
  } finally {
    await mongoose.disconnect();
  }
})();
