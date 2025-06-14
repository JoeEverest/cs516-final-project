import { Router } from "express";
import { getUsers } from "../controllers/users";

export const userRoutes = Router();

userRoutes.get("/", getUsers);
