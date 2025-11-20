import { Context } from "hono";
import { UserModel } from "../models/User";

export const getUsers = async (c: Context) => {
  try {
    const users = await UserModel.find();
    return c.json(users);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};

export const createUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const user = new UserModel(body);
    await user.save();
    return c.json(user, 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    const user = await UserModel.findOne({ email });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // In a real app, compare hashed passwords
    if (user.password !== password) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    return c.json(user);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};

export const updateUser = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const user = await UserModel.findByIdAndUpdate(id, body, { new: true });
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};
