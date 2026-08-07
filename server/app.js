const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const { startCleanup } = require("./services/cleanup");

dotenv.config();

const frontendUrl = (process.env.FRONTEND_URL || 'https://pakhuang.store').replace(/\/$/, '');
const allowedOrigins = [
  'https://pakhuang.store',
  'https://www.pakhuang.store',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  frontendUrl
];

// Development helper: patch oauth library to log raw token responses for debugging
if ((process.env.NODE_ENV || 'development') === 'development') {
  try {
    const OAuth2 = require('oauth').OAuth2;
    const originalGetToken = OAuth2.prototype.getOAuthAccessToken;
    OAuth2.prototype.getOAuthAccessToken = function(code, params, callback) {
      return originalGetToken.call(this, code, params, (err, accessToken, refreshToken, results) => {
        if (err) {
          console.error('OAuth2.getOAuthAccessToken error:', err && err.message ? err.message : err);
          try {
            console.error('Raw token response / error data:', err && err.data ? err.data : results || err);
          } catch (e) {
            console.error('Error printing raw token response:', e);
          }
        } else {
          console.log('OAuth2 token exchange success, raw results:', results);
        }
        return callback(err, accessToken, refreshToken, results);
      });
    };
    console.log('Patched oauth.OAuth2.getOAuthAccessToken for verbose token logging (development)');
  } catch (e) {
    console.warn('Could not patch oauth library for debug logging:', e && e.message ? e.message : e);
  }
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanOrigin) || nodeEnv !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';

const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, 'uploads'));
const outputsDir = path.resolve(process.env.OUTPUTS_DIR || path.join(__dirname, 'outputs'));
const tempDir = path.resolve(process.env.TEMP_DIR || path.join(__dirname, 'temp'));
const clientDir = path.resolve(__dirname, '..', 'frontend-react', 'dist');

const {
  ensureUser,
  getUserConversionsThisMonth,
  getUserPlan,
  canConvertNow,
  secondsUntilNextConversion,
  recordConversion,
  setUserPlan,
  getUserDetails,
  claimFreePremium
} = require('./services/userStats');

[uploadsDir, outputsDir, tempDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to get current month key (YYYY-MM)
function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin) || nodeEnv !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Penting: Izinkan Express membaca header dari reverse proxy Nginx agar cookie secure (HTTPS) bisa terkirim
app.set('trust proxy', 1);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: nodeEnv === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: nodeEnv === 'production' ? '.pakhuang.store' : undefined,
    sameSite: nodeEnv === 'production' ? 'none' : 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Auth Bypass Middleware for Localhost/Termux Use
const isAuthBypassed = process.env.BYPASS_AUTH === 'true' || !process.env.DISCORD_CLIENT_ID;
if (isAuthBypassed) {
  app.use((req, res, next) => {
    req.isAuthenticated = () => true;
    req.user = {
      id: 'local-user-id',
      username: 'LocalUser',
      discriminator: '0000',
      avatar: null,
      email: 'local@localhost',
      guilds: []
    };
    next();
  });
}

// Discord OAuth2 Strategy
const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
const discordCallbackUrl = process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/auth/discord/callback';

if (discordClientId && discordClientSecret) {
  passport.use(new DiscordStrategy({
    clientID: discordClientId,
    clientSecret: discordClientSecret,
    callbackURL: discordCallbackUrl,
    scope: ['identify', 'email', 'guilds']
  }, (accessToken, refreshToken, profile, done) => {
    // Store user profile in session
    return done(null, profile);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  console.log('Discord OAuth2 configured successfully');
} else {
  console.warn('Discord OAuth2 credentials not found. Discord login will not be available.');
}

const convertRoutes = require("./routes/convert")(io);
app.use("/api", convertRoutes);
const adminRoutes = require('./routes/admin')(clientDir);
app.use('/admin', adminRoutes);
app.use("/download", express.static(outputsDir));

app.get("/index.html", (req, res) => {
  res.redirect("/");
});

app.get("/converter.html", (req, res) => {
  res.redirect("/#/converter");
});

app.use(express.static(clientDir, { index: false }));

// Discord Authentication Routes
app.get('/auth/discord', (req, res, next) => {
  if (isAuthBypassed) {
    return res.redirect('/converter');
  }
  passport.authenticate('discord')(req, res, next);
});

app.get('/auth/discord/callback', (req, res, next) => {
  if (isAuthBypassed) {
    return res.redirect('/converter');
  }
  passport.authenticate('discord', (err, user, info) => {
    if (err) {
      console.error('Discord authentication error (token exchange):', err && err.message ? err.message : err);
      console.error('Full error object:', err);
      // Provide a helpful response for debugging (in development only)
      if (nodeEnv === 'development') {
        return res.status(500).send(`<pre>Discord auth error:\n${String(err && err.stack ? err.stack : err)}</pre>`);
      }
      return res.redirect(`${frontendUrl}/?auth_error=1`);
    }

    if (!user) {
      console.warn('Discord authentication failed, info:', info);
      return res.redirect(`${frontendUrl}/?auth_failed=1`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Error logging in user after Discord auth:', loginErr);
        return res.redirect(`${frontendUrl}/?auth_login_error=1`);
      }
      
      // Immediately save user's Discord profile to stats
      ensureUser(req.user.id, {
        username: req.user.username,
        avatar: req.user.avatar,
        discriminator: req.user.discriminator
      });
      
      // After successful login, verify guild membership.
      // Prefer checking `req.user.guilds` (available when scope 'guilds' is requested).
      const guildId = process.env.DISCORD_GUILD_ID || process.env.DISCORD_SERVER_ID;
      const botToken = process.env.DISCORD_BOT_TOKEN;

      async function checkMembershipAndRedirect() {
        try {
          if (guildId) {
            // If passport returned guilds in the profile, check there first
            if (req.user && Array.isArray(req.user.guilds)) {
              const found = req.user.guilds.some(g => String(g.id) === String(guildId));
              if (!found) return res.redirect(`${frontendUrl}/#/join-discord`);
              return res.redirect(`${frontendUrl}/#/converter`);
            }

            // Fallback: if bot token is configured, query the Guild Member endpoint
            if (botToken) {
              const https = require('https');
              const options = {
                method: 'GET',
                headers: {
                  'Authorization': `Bot ${botToken}`,
                  'User-Agent': 'AudioConverter/1.0 (https://example.com)'
                }
              };

              const url = `https://discord.com/api/v10/guilds/${guildId}/members/${req.user.id}`;
              const memberPresent = await new Promise((resolve) => {
                const reqGet = https.request(url, options, (resp) => {
                  if (resp.statusCode === 200) return resolve(true);
                  if (resp.statusCode === 404) return resolve(false);
                  console.warn('Discord membership check returned status', resp.statusCode);
                  return resolve(false);
                });
                reqGet.on('error', (e) => { console.error('Guild membership check error', e); resolve(false); });
                reqGet.end();
              });

              if (!memberPresent) return res.redirect(`${frontendUrl}/#/join-discord`);
              return res.redirect(`${frontendUrl}/#/converter`);
            }
          }
        } catch (e) {
          console.error('Error checking guild membership:', e);
        }
        // If guild not configured or check failed, proceed to converter
        return res.redirect(`${frontendUrl}/#/converter`);
      }

      return checkMembershipAndRedirect();
    });
  })(req, res, next);
});

// Join-discord helper route: redirects to invite URL from env
app.get('/join-discord/invite', (req, res) => {
  const invite = process.env.DISCORD_INVITE_URL || 'https://discord.gg/your-invite-here';
  res.redirect(invite);
});

// Serve a simple join page
app.get('/join-discord', (req, res) => {
  res.sendFile(path.join(clientDir, 'join-discord.html'));
});

app.get('/auth/logout', (req, res) => {
  if (isAuthBypassed) {
    return res.redirect('/');
  }
  req.logout((err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.redirect(frontendUrl + '/');
  });
});

app.post('/auth/logout-silent', (req, res) => {
  if (isAuthBypassed) {
    return res.json({ success: true });
  }
  req.logout((err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    // Ensure user stats are created/updated with Discord profile data
    ensureUser(req.user.id, {
      username: req.user.username,
      avatar: req.user.avatar,
      discriminator: req.user.discriminator
    });
    const userDetails = getUserDetails(req.user.id);
    res.json({ 
      success: true, 
      user: {
        id: req.user.id,
        username: req.user.username,
        discriminator: req.user.discriminator,
        avatar: req.user.avatar,
        email: req.user.email,
        loginOrder: userDetails.loginOrder,
        firstLoginAt: userDetails.firstLoginAt,
        claimedFreePremium: userDetails.claimedFreePremium
      }
    });
  } else {
    res.json({ success: false, user: null });
  }
});

// User stats endpoints
app.get('/api/user-stats', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ success: false, error: 'Not authenticated' });
  }
  
  // Ensure user stats are created/updated with Discord profile data
  ensureUser(req.user.id, {
    username: req.user.username,
    avatar: req.user.avatar,
    discriminator: req.user.discriminator
  });
  
  const conversionsThisMonth = getUserConversionsThisMonth(req.user.id);
  const plan = getUserPlan(req.user.id);
  const canConvert = canConvertNow(req.user.id);
  const secondsLeft = secondsUntilNextConversion(req.user.id);
  const userDetails = getUserDetails(req.user.id);

  res.json({
    success: true,
    data: {
      conversionsThisMonth,
      userId: req.user.id,
      currentMonth: getMonthKey(),
      plan,
      planStartedAt: userDetails.planStartedAt,
      planExpiresAt: userDetails.planExpiresAt,
      loginOrder: userDetails.loginOrder,
      firstLoginAt: userDetails.firstLoginAt,
      canConvertNow: canConvert,
      nextConversionSeconds: secondsLeft,
      freePlanMaxDurationSeconds: plan === 'free' ? 8 * 60 : null,
      claimedFreePremium: userDetails.claimedFreePremium,
      hasRobloxConnected: userDetails.hasRobloxConnected,
      robloxTargetId: userDetails.robloxTargetId,
      robloxTargetType: userDetails.robloxTargetType
    }
  });
});

app.post('/api/track-conversion', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ success: false, error: 'Not authenticated' });
  }
  
  recordConversion(req.user.id);
  res.json({ success: true });
});

app.post('/api/set-plan', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ success: false, error: 'Not authenticated' });
  }

  const plan = req.body.plan;
  const allowedPlans = ['free', 'premium-week', 'premium-month'];
  if (!allowedPlans.includes(plan)) {
    return res.status(400).json({ success: false, error: 'Invalid plan type' });
  }

  setUserPlan(req.user.id, plan);
  res.json({ success: true, data: { plan } });
});

app.post('/api/claim-free-premium', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const result = claimFreePremium(req.user.id);
  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

app.get("/converter", (req, res) => {
  res.redirect("/#/converter");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

if (!isAuthBypassed) {
  startCleanup({
    uploadsDir,
    tempDir,
    outputsDir,
    intervalMinutes: Number(process.env.CLEANUP_INTERVAL_MINUTES || 10),
    ttlMinutes: Number(process.env.TEMP_TTL_MINUTES || 30)
  });
} else {
  console.log('Local/Bypass mode active: Automatic file cleanup is disabled.');
}
