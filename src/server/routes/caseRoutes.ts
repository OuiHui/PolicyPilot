import { Hono } from "hono";
import * as caseController from "../controllers/caseController";

const caseRoutes = new Hono();

caseRoutes.get("/", caseController.getCases);
caseRoutes.post("/", caseController.createCase);
caseRoutes.patch("/:id", caseController.updateCase);
caseRoutes.post("/:id/files", caseController.uploadDenialFiles);
caseRoutes.post("/:id/analyze", caseController.analyzeCase);
caseRoutes.post("/:id/generate-email", caseController.generateEmail);
caseRoutes.post("/:id/extract-denial", caseController.extractDenial);
caseRoutes.delete("/:id", caseController.deleteCase);

export default caseRoutes;
