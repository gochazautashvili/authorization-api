import express, { Router } from "express";
import { create_hotel, getHotels } from "../controllers/hotels";

const router: Router = express.Router();

// GET route
router.get("/", getHotels);

// POST route
router.post("/", create_hotel);

export default router;
