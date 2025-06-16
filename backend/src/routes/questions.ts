import { Router } from "express";
import { createQuestion, getQuestions } from "../controllers/questions";

export const questionRoutes = Router();

questionRoutes.post("/", createQuestion);
questionRoutes.get("/:topicId", getQuestions);
