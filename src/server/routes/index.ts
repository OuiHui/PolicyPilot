import { Hono } from "hono";
import userRoutes from "./userRoutes";
import planRoutes from "./planRoutes";
import caseRoutes from "./caseRoutes";

const api = new Hono();

api.route("/users", userRoutes);
api.route("/plans", planRoutes);
api.route("/cases", caseRoutes);

export default api;
