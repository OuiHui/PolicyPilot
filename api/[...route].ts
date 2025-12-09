// Main API handler for Vercel
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { connectDB } from "../src/server/db";

console.log("✅ Step 1: Base imports done");

// Import ALL routes like the original
import userRoutes from "../src/server/routes/userRoutes";
console.log("✅ Step 2a: userRoutes imported");

import planRoutes from "../src/server/routes/planRoutes";
console.log("✅ Step 2b: planRoutes imported");

import caseRoutes from "../src/server/routes/caseRoutes";
console.log("✅ Step 2c: caseRoutes imported");

import emailRoutes from "../src/server/routes/emailRoutes";
console.log("✅ Step 2d: emailRoutes imported (Resend)");

import inboundRoutes from "../src/server/routes/inboundRoutes";
console.log("✅ Step 2e: inboundRoutes imported (Resend Inbound)");

const app = new Hono().basePath("/api");

app.use("/*", cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
}));

// Health check (no DB)
app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB middleware
app.use("*", async (c, next) => {
    try {
        await connectDB();
        return await next();
    } catch (e: any) {
        console.error("Database connection failed:", e);
        return c.json({ error: "Database connection failed", details: e.message }, 500);
    }
});

// Mount ALL routes
app.route("/users", userRoutes);
app.route("/plans", planRoutes);
app.route("/cases", caseRoutes);
app.route("/gmail", emailRoutes); // Using Resend, kept /gmail path for frontend compatibility
app.route("/email", inboundRoutes); // Resend Inbound webhook at /api/email/inbound

console.log("✅ Step 3: All routes mounted");

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

console.log("✅ Step 4: All handlers exported");
