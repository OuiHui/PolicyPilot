import { Hono } from "hono";
import * as planController from "../controllers/planController";

const planRoutes = new Hono();

planRoutes.get("/", planController.getPlans);
planRoutes.post("/", planController.createPlan);

export default planRoutes;
