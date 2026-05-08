import express from "express";
import {
	companyDetails,
	listCompanies
} from "../controllers/companyController.js";

const router = express.Router();

router.get("/", listCompanies);
router.get("/:id", companyDetails);

export default router;