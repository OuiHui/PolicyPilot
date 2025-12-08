import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { connectDB } from "../src/server/db";
import userRoutes from "../src/server/routes/userRoutes";
import planRoutes from "../src/server/routes/planRoutes";
import caseRoutes from "../src/server/routes/caseRoutes";

console.log("✅ Vercel API: All imports loaded");

// Create the main app
const app = new Hono().basePath("/api");

// Enable CORS
app.use("/*", cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
}));

// Health check endpoint (no MongoDB) - MUST be before the DB middleware
app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB ONLY for non-health routes
app.use("*", async (c, next) => {
    // Skip MongoDB for health endpoints
    const path = c.req.path;
    if (path === "/api/health" || path.startsWith("/api/health/")) {
        return await next();
    }

    try {
        await connectDB();
        return await next();
    } catch (e: any) {
        console.error("Database connection failed:", e);
        return c.json({ error: "Database connection failed", details: e.message }, 500);
    }
});

// Test MongoDB connection separately
app.get("/health/mongo", async (c) => {
    try {
        console.log("Testing MongoDB connection...");
        await connectDB();
        return c.json({ status: "connected", db: "mongodb" });
    } catch (e: any) {
        console.error("MongoDB health check failed:", e);
        return c.json({ status: "failed", error: e.message }, 500);
    }
});

// Mount API routes
app.route("/users", userRoutes);
app.route("/plans", planRoutes);
app.route("/cases", caseRoutes);

console.log("✅ Vercel API: All routes mounted");

// Export for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

export default handle(app);
