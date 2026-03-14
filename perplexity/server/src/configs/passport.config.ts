import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import env from './ENV';
import prisma from './db';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0].value;
        const providerAccountId = profile.id;

        if (!email) {
          return done(new Error('No email found from Google profile'), undefined);
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              name,
              avatar,
              accounts: {
                create: {
                  provider: 'google',
                  providerAccountId,
                  accessToken,
                  refreshToken,
                },
              },
            },
          });
        } else {
          // Link account if not linked or update token
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: 'google',
                providerAccountId,
              },
            },
          });

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: user.id,
                provider: 'google',
                providerAccountId,
                accessToken,
                refreshToken,
              },
            });
          } else {
            // Update tokens
            await prisma.account.update({
              where: { id: existingAccount.id },
              data: { accessToken, refreshToken }
            })
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;
