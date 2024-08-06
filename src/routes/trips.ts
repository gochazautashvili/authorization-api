import express, { Router } from "express";
import { create_trip, getTrips } from "../controllers/trips";

const router: Router = express.Router();

// GET route
router.get("/", getTrips);

// POST route
router.post("/", create_trip);

export default router;
