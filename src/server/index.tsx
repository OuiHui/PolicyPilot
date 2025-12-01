import dotenv from 'dotenv';
const localEnv = dotenv.config({ path: '.env.local' });
const defaultEnv = dotenv.config({ path: '.env' });
console.log('Debug: .env.local parsed:', localEnv.parsed);
console.log('Debug: .env parsed:', defaultEnv.parsed);

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { connectDB } from "./db";
import api from "./routes/index";
import gmailRoutes from "./routes/gmailRoutes";

// Connect to Database
connectDB();

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Mount API routes
app.route("/api", api);
app.route("/api/gmail", gmailRoutes);

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});