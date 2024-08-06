import express, { Router } from "express";
import {
  getCurrentUser,
  sign_in,
  sign_up,
  sign_out,
  reset_password,
  reset_password_update,
  google_auth,
  google_auth_callback,
  google_auth_success,
  facebook_auth,
  facebook_auth_callback,
  facebook_auth_success,
} from "../controllers/users";
import { middleware } from "../middleware/middleware";

const router: Router = express.Router();

router.get("/", middleware, getCurrentUser);

// post
router.post("/sign-up", sign_up);
router.post("/sign-in", sign_in);
router.post("/sign-out", middleware, sign_out);
router.post("/reset-password", reset_password);
router.post("/reset-password-update", reset_password_update);

// google auth routes
router.get("/google-auth", google_auth);
router.get("/google-auth/callback", google_auth_callback, google_auth_success);

// facebook auth routes
router.get("/facebook-auth", facebook_auth);
router.get(
  "/facebook-auth/callback",
  facebook_auth_callback,
  facebook_auth_success
);

export default router;
