import mongoose from "mongoose";
import { login } from "./controllers/userController";
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

    // 1. Test with non-existent user
    console.log("Testing non-existent user...");
    const ctx1 = mockContext({ email: "nonexistent@example.com", password: "123" });
    const res1 = await login(ctx1);
    console.log("Result 1:", res1);
    if (res1.status !== 404) throw new Error("Expected 404 for non-existent user");

    // 2. Test with correct credentials (using seeded user)
    console.log("Testing correct credentials...");
    const ctx2 = mockContext({ email: "user@example.com", password: "password123" });
    const res2 = await login(ctx2);
    console.log("Result 2:", res2);
    if (res2.status !== 200) throw new Error("Expected 200 for correct credentials");

    // 3. Test with wrong password
    console.log("Testing wrong password...");
    const ctx3 = mockContext({ email: "user@example.com", password: "wrongpassword" });
    const res3 = await login(ctx3);
    console.log("Result 3:", res3);
    if (res3.status !== 401) throw new Error("Expected 401 for wrong password");

    console.log("Login logic verification passed!");
  } catch (e) {
    console.error("Verification failed:", e);
  } finally {
    await mongoose.disconnect();
  }
})();
