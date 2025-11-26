import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { connectDB } from "../src/server/db";
import userRoutes from "../src/server/routes/userRoutes";
import planRoutes from "../src/server/routes/planRoutes";
import caseRoutes from "../src/server/routes/caseRoutes";

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

// Health check endpoint
app.get("/health", (c) => {
    return c.json({ status: "ok" });
});

// Connect to MongoDB before handling requests
app.use("*", async (c, next) => {
    await connectDB();
    return next();
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
