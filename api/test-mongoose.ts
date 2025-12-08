// Test #2: Add mongoose import to see if that's the issue
import { Hono } from "hono";
import { handle } from "hono/vercel";

console.log("✅ Step 1: Hono imported");

// Test mongoose import
import mongoose from "mongoose";
console.log("✅ Step 2: Mongoose imported");

const app = new Hono().basePath("/api");

app.get("/test-mongoose", (c) => {
    return c.json({
        status: "ok",
        message: "Mongoose import works!",
        mongooseVersion: mongoose.version,
        timestamp: new Date().toISOString()
    });
});

console.log("✅ Step 3: Route defined");

export const GET = handle(app);
console.log("✅ Step 4: Handler exported");
