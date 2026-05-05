import express from "express";
import {
  listDirectors,
  directorCompanies
} from "../controllers/directorController.js";

const router = express.Router();

router.get("/", listDirectors);
router.get("/:id/companies", directorCompanies);

export default router;
