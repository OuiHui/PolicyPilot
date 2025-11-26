import { Hono } from "hono";
import { getFileSignedUrl } from "../controllers/fileController";

const fileRoutes = new Hono();

fileRoutes.post("/signed-url", getFileSignedUrl);

export default fileRoutes;
