// Test #4: Test route imports one by one
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { connectDB } from "../src/server/db";

console.log("✅ Step 1: Base imports done");

// Test userRoutes import
import userRoutes from "../src/server/routes/userRoutes";
console.log("✅ Step 2: userRoutes imported");

const app = new Hono().basePath("/api");

app.use("/*", cors({ origin: "*" }));

// Connect to MongoDB middleware
app.use("*", async (c, next) => {
    try {
        await connectDB();
        return await next();
    } catch (e: any) {
        return c.json({ error: "DB connection failed", details: e.message }, 500);
    }
});

// Mount only user routes
app.route("/users", userRoutes);

app.get("/test-users", (c) => {
    return c.json({
        status: "ok",
        message: "User routes imported successfully!",
        timestamp: new Date().toISOString()
    });
});

console.log("✅ Step 3: Routes mounted");

export const GET = handle(app);
export const POST = handle(app);
console.log("✅ Step 4: Handler exported");
