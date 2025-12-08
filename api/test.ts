// Minimal test API to debug Vercel function initialization
// This file intentionally has minimal imports to isolate the issue
import { Hono } from "hono";
import { handle } from "hono/vercel";

console.log("✅ Step 1: Hono imported");

const app = new Hono().basePath("/api");

console.log("✅ Step 2: Hono app created");

app.get("/test", (c) => {
    return c.json({
        status: "ok",
        message: "Minimal test route works!",
        timestamp: new Date().toISOString()
    });
});

console.log("✅ Step 3: Route defined");

export const GET = handle(app);
console.log("✅ Step 4: Handler exported");
