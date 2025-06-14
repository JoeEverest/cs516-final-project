import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  populateData,
} from "../controllers/questions";

export const questionRoutes = Router();

questionRoutes.post("/", createQuestion);
questionRoutes.get("/:topicId", getQuestions);
questionRoutes.post("/populate", populateData);
