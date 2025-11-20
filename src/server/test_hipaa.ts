import mongoose from "mongoose";
import { createUser, updateUser, login } from "./controllers/userController";
import { UserModel } from "./models/User";
import { connectDB } from "./db";

// Mock Hono Context
const mockContext = (body: any, params: any = {}) => {
  return {
    req: {
      json: async () => body,
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

    const testEmail = `hipaa-test-${Date.now()}@example.com`;
    console.log(`Testing HIPAA flow with email: ${testEmail}`);

    // 1. Create User
    const ctx1 = mockContext({ 
        email: testEmail, 
        password: "password123",
        firstName: "Hipaa",
        lastName: "Tester"
    });
    const res1 = await createUser(ctx1);
    if (res1.status !== 201) throw new Error("Signup failed");
    const userId = res1.data._id;
    console.log("User created:", userId);

    // 2. Verify initial HIPAA status (should be false)
    if (res1.data.hipaaAccepted !== false) throw new Error("Initial HIPAA status should be false");

    // 3. Login and check status
    const ctx2 = mockContext({ email: testEmail, password: "password123" });
    const res2 = await login(ctx2);
    if (res2.status !== 200) throw new Error("Login failed");
    if (res2.data.hipaaAccepted !== false) throw new Error("Login HIPAA status should be false");
    console.log("Initial login verified (hipaaAccepted: false)");

    // 4. Update HIPAA status
    console.log("Updating HIPAA status...");
    const ctx3 = mockContext({ hipaaAccepted: true }, { id: userId });
    const res3 = await updateUser(ctx3);
    if (res3.status !== 200) throw new Error("Update failed");
    if (res3.data.hipaaAccepted !== true) throw new Error("Updated HIPAA status should be true");

    // 5. Login again and check status
    const res4 = await login(ctx2);
    if (res4.data.hipaaAccepted !== true) throw new Error("Re-login HIPAA status should be true");
    console.log("Re-login verified (hipaaAccepted: true)");

    console.log("HIPAA verification passed!");
  } catch (e) {
    console.error("Verification failed:", e);
  } finally {
    await mongoose.disconnect();
  }
})();
