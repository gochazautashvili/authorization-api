import { Request, Response } from "express";
import db from "../lib/db";

export const getTrips = async (req: Request, res: Response) => {
  try {
    const trips = await db.trip.findMany({
      take: 3,
    });

    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

// this route is not for production it's only developer for add new trip
export const create_trip = async (req: Request, res: Response) => {
  try {
    await db.trip.create({
      data: { ...req.body },
    });

    return res.status(200).json("success");
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};
