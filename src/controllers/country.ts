import { Request, Response } from "express";
import db from "../lib/db";

export const getAllCountry = async (req: Request, res: Response) => {
  try {
    const countries = await db.country.findMany({
      take: 4,
      include: {
        _count: { select: { properties: true } },
      },
    });

    return res.status(200).json(countries);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

// this route is not for production it's only developer for add new country
export const create_country = async (req: Request, res: Response) => {
  const { image, title } = req.body;

  try {
    await db.country.create({
      data: {
        image,
        title,
      },
    });

    return res.status(201).json("success");
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};
