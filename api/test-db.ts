// Test #3: Add db import to test connectDB
import { Hono } from "hono";
import { handle } from "hono/vercel";

console.log("✅ Step 1: Hono imported");

// Test db import (this has mongoose.connect logic)
import { connectDB } from "../src/server/db";
console.log("✅ Step 2: db module imported");

const app = new Hono().basePath("/api");

app.get("/test-db", async (c) => {
    try {
        console.log("Attempting to connect to DB...");
        await connectDB();
        return c.json({
            status: "ok",
            message: "DB connection works!",
            timestamp: new Date().toISOString()
        });
    } catch (e: any) {
        console.error("DB connection failed:", e.message);
        return c.json({
            status: "error",
            message: e.message,
            timestamp: new Date().toISOString()
        }, 500);
    }
});

console.log("✅ Step 3: Route defined");

export const GET = handle(app);
console.log("✅ Step 4: Handler exported");
