import { Hono } from "hono";
import * as planController from "../controllers/planController";

const planRoutes = new Hono();

planRoutes.get("/", planController.getPlans);
planRoutes.post("/", planController.createPlan);
planRoutes.delete("/:id", planController.deletePlan);

export default planRoutes;
