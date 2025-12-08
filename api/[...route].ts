import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { connectDB } from "../src/server/db";
import userRoutes from "../src/server/routes/userRoutes";
import planRoutes from "../src/server/routes/planRoutes";
import caseRoutes from "../src/server/routes/caseRoutes";
// NOTE: Gmail routes are NOT included on Vercel because they require
// filesystem access for OAuth token storage which is not available in serverless.
// Google OAuth login only works in local development.

// Create the main app
const app = new Hono().basePath("/api");

// Enable CORS
app.use(
    "/*",
    cors({
        origin: "*",
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
    })
);

// Health check endpoint (no MongoDB)
app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
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

// Connect to MongoDB before handling requests
app.use("*", async (c, next) => {
    try {
        await connectDB();
        return await next();
    } catch (e: any) {
        console.error("Database connection failed:", e);
        return c.json({ error: "Database connection failed", details: e.message }, 500);
    }
});

// Mount API routes
app.route("/users", userRoutes);
app.route("/plans", planRoutes);
app.route("/cases", caseRoutes);

// Export for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

export default handle(app);

