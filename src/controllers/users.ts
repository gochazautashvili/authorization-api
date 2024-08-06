import { Request, Response } from "express";
import db from "../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import passport from "passport";
import { User } from "@prisma/client";
import verifyToken from "../lib/verifyToken";
const resend = new Resend(process.env.RESEND_KEY);

export const sign_up = async (req: Request, res: Response) => {
  const { gmail, password, confirmPassword } = req.body;

  if (!gmail || !password || !confirmPassword) {
    return res.status(404).json("data is not found!");
  }

  if (password !== confirmPassword) {
    return res.status(404).json("Passwords are not the same!");
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { gmail: gmail },
    });

    if (existingUser) {
      return res.status(404).json("Gmail already exist!");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        gmail,
        hashPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "5h",
    });

    return res
      .status(200)
      .cookie("user_token", token, {
        maxAge: 1000 * 60 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({ success: true, message: "user sign in successfully :)" });
  } catch (error) {
    console.log(error);

    return res.status(500).json("Interval server error!");
  }
};

export const sign_in = async (req: Request, res: Response) => {
  const { gmail, password, keep_signed_in } = req.body;

  if (!gmail || !password) {
    return res.status(404).json("data is not found!");
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { gmail },
    });

    if (!existingUser || !existingUser.hashPassword) {
      return res.status(404).json("User is not exist!");
    }

    const comparePassword = await bcrypt.compare(
      password,
      existingUser.hashPassword
    );

    if (!comparePassword) {
      return res.status(404).json("User is not exist!");
    }

    const token = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_SECRET!,
      {
        expiresIn: keep_signed_in ? undefined : "5h",
      }
    );

    return res
      .status(200)
      .cookie("user_token", token, {
        maxAge: 1000 * 60 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({ success: true, message: "user sign in successfully" });
  } catch (error) {
    console.log(error);

    return res.status(500).json("Interval server error!");
  }
};

export const sign_out = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(501).json("Unauthorized!");
  }

  return res
    .status(200)
    .clearCookie("user_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .json("success");
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, gmail: true, avatar: true },
    });

    if (!user) {
      return res.status(404).json("User is not exist!");
    }

    return res.json(user).status(200);
  } catch (error) {
    return res.status(500).json("Interval server error!");
  }
};

export const reset_password = async (req: Request, res: Response) => {
  const { gmail } = req.body;

  if (!gmail) {
    return res.status(404).json("Gmail is not defined?");
  }

  const token = jwt.sign({ gmail }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  });

  const link = `${process.env.FRONTEND_URL}/auth/reset-password-update?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: gmail,
      subject: "Reset Your Password",
      html: `<div>
      <h1>Go to the given link to change your password.</h1>
      <a href="${link}" class="text-blue">Reset Password Link</a>
      </div>`,
    });

    if (error) {
      return res.status(404).json({ error });
    }

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json("Interval server error!");
  }
};

export const reset_password_update = async (req: Request, res: Response) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password) {
    return res.status(404).json("gmail or password not found");
  }

  if (password !== confirmPassword) {
    return res.status(404).json("confirm password do not contain password");
  }

  const { valid, gmail } = verifyToken(token);

  if (!valid) {
    return res.status(404).json("token is expired");
  }

  if (!gmail) {
    return res.status(404).json("gmail or password not found");
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await db.user.findUnique({
      where: { gmail },
    });

    if (!user) {
      return res.status(404).json("Email is invalid");
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        hashPassword,
      },
    });

    return res.status(201).json("Password successfully updated");
  } catch (error) {
    console.log(error);

    return res.status(500).json("Interval server error!");
  }
};

// Google authorization route handlers

export const google_auth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const google_auth_callback = passport.authenticate("google", {
  failureRedirect: `${process.env.FRONTEND_URL!}/auth/sign-in`,
});

export const google_auth_success = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    if (!user) {
      return res.status(501).json("Unauthorized");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);

    return res
      .cookie("user_token", token, {
        maxAge: 1000 * 60 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .redirect(process.env.FRONTEND_URL!);
  } catch (error) {
    return res.status(500).json("Interval server error!");
  }
};

// Facebook authorization route handlers

export const facebook_auth = passport.authenticate("facebook");

export const facebook_auth_callback = passport.authenticate("facebook", {
  failureRedirect: `${process.env.FRONTEND_URL!}/auth/sign-in`,
});

export const facebook_auth_success = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    if (!user) {
      return res.status(501).json("Unauthorized");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);

    return res
      .cookie("user_token", token, {
        maxAge: 1000 * 60 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .redirect(process.env.FRONTEND_URL!);
  } catch (error) {
    return res.status(500).json("Interval server error!");
  }
};
