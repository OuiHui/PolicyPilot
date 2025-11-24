import { Hono } from "hono";
import * as caseController from "../controllers/caseController";

const caseRoutes = new Hono();

caseRoutes.get("/", caseController.getCases);
caseRoutes.post("/", caseController.createCase);
caseRoutes.post("/:id/files", caseController.uploadDenialFiles);
caseRoutes.delete("/:id", caseController.deleteCase);

export default caseRoutes;
