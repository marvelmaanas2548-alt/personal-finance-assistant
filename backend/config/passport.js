const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getDb } = require('../db');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = getDb();
        const googleId = profile.id;
        const email = (profile.emails && profile.emails[0]?.value) || '';
        const name = profile.displayName || email.split('@')[0];
        const avatarUrl = (profile.photos && profile.photos[0]?.value) || '';

        // Check if user already exists by googleId
        let user = await db.get('SELECT * FROM users WHERE googleId = ?', [googleId]);

        if (!user) {
          // Check by email in case they registered with email first
          user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

          if (user) {
            // Link Google ID to existing email-registered account
            await db.run('UPDATE users SET googleId = ?, authProvider = ?, avatarUrl = ? WHERE id = ?', [
              googleId, 'google', avatarUrl || user.avatarUrl, user.id
            ]);
            user.googleId = googleId;
          } else {
            // Create brand new user
            const userId = `u_google_${Date.now()}`;
            await db.run(
              `INSERT INTO users (id, googleId, name, email, authProvider, avatarUrl)
               VALUES (?, ?, ?, ?, 'google', ?)`,
              [userId, googleId, name, email, avatarUrl]
            );
            user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
