import express, { Router } from "express";
import { create_country, getAllCountry } from "../controllers/country";

const router: Router = express.Router();

// GET route
router.get("/", getAllCountry);

// POST route
router.post("/", create_country);

export default router;
