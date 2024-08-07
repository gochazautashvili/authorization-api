import express, { Express } from "express";
import cors from "cors";
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import user_router from "./routes/users";
import "dotenv/config";
import "./middleware/google-auth";
import "./middleware/facebook-auth";

const app: Express = express();

app.use(
  cors({
    origin: "https://authorization-servace.netlify.app",
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// session
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Oauth
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/users", user_router);

// api listen
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
