import { Hono } from "hono";
import * as userController from "../controllers/userController";

const userRoutes = new Hono();

userRoutes.get("/", userController.getUsers);
userRoutes.post("/", userController.createUser);
userRoutes.post("/login", userController.login);
userRoutes.patch("/:id", userController.updateUser);

export default userRoutes;
