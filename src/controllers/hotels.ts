import { Request, Response } from "express";
import db from "../lib/db";

export const getHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await db.hotel.findMany({
      take: 4,
      include: {
        _count: { select: { rooms: true } },
      },
    });

    return res.status(200).json(hotels);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

// this route is not for production it's only developer for add new trip
export const create_hotel = async (req: Request, res: Response) => {
  try {
    await db.hotel.create({
      data: { ...req.body },
    });

    return res.status(200).json("success");
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};
