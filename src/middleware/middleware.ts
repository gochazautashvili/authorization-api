import { NextFunction, Request, Response } from "express";
import verifyToken from "../lib/verifyToken";

export const middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.user_token;

    if (!token) {
      return res.status(404).json("Token is not found!");
    }
    const { userId, valid } = verifyToken(token);

    if (!valid) {
      return res.clearCookie("user_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }

    if (!userId) {
      return res.status(404).json("User is not found!");
    }

    req.body.userId = userId;
    next();
  } catch (error) {
    return res.status(500).json("Interval server error");
  }
};
