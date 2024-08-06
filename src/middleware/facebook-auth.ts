import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import db from "../lib/db";

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: "https://authorization-api-1wnn.onrender.com/users/facebook-auth/callback",
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      const facebookId = profile.id;

      const user = await db.user.upsert({
        where: { facebookId },
        create: { facebookId },
        update: {},
      });

      return done(null, user);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user: Express.User, done) {
  done(null, user);
});
