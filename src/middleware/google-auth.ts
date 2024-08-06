import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "../lib/db";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      callbackURL: `https://authorization-api-1wnn.onrender.com/users/google-auth/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const gmail = profile.emails?.[0].value;
        const avatar = profile._json.picture;

        if (!googleId || !gmail) {
          return done(
            new Error("GoogleId or Email not found in profile"),
            false
          );
        }

        const user = await db.user.upsert({
          where: { googleId, gmail },
          create: { googleId, gmail, avatar },
          update: {},
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});
