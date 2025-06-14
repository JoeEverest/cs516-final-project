import { Router } from "express";
import { getTopics } from "../controllers/topics";

export const topicRoutes = Router();

topicRoutes.get("/", getTopics);
