const express = require('express');
const path = require('path');

module.exports = function (clientDir) {
  const router = express.Router();

  const {
    getAllUsers,
    setUserPlan
  } = require('../services/userStats');

  function getAdminDiscordId() {
    return process.env.ADMIN_DISCORD_ID ? String(process.env.ADMIN_DISCORD_ID).trim() : null;
  }

  function ensureAdmin(req, res, next) {
    // Allow if session flag set
    if (req.session && req.session.isAdmin) return next();

    // Allow if logged in via Discord and matches ADMIN_DISCORD_ID
    const adminDiscordId = getAdminDiscordId();
    const currentUserId = req.user ? String(req.user.id).trim() : null;
    if (adminDiscordId && req.isAuthenticated && req.isAuthenticated() && currentUserId && currentUserId === adminDiscordId) {
      req.session.isAdmin = true;
      return next();
    }

    return res.status(401).json({ success: false, error: 'Admin authentication required' });
  }

  router.post('/login', (req, res) => {
    const adminDiscordId = getAdminDiscordId();
    const currentUserId = req.user ? String(req.user.id).trim() : null;

    // If user is logged in via Discord and matches ADMIN_DISCORD_ID, allow without password
    if (adminDiscordId && req.isAuthenticated && req.isAuthenticated() && currentUserId && currentUserId === adminDiscordId) {
      req.session.isAdmin = true;
      return res.json({ success: true, method: 'discord' });
    }

    // If admin Discord ID is configured, disallow fallback login entirely
    if (adminDiscordId) {
      return res.status(401).json({ success: false, error: 'Discord-only admin mode enabled. Login via Discord with the configured admin account.' });
    }

    // Fallback username/password if configured (ADMIN_USER + ADMIN_PASS or ADMIN_FALLBACK_PASS)
    const username = req.body.username;
    const password = req.body.password;
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS || process.env.ADMIN_FALLBACK_PASS;
    if (!adminUser || !adminPass) {
      return res.status(500).json({ success: false, error: 'Admin login not configured' });
    }
    if (username === adminUser && password === adminPass) {
      req.session.isAdmin = true;
      return res.json({ success: true, method: 'fallback' });
    }
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  });

  router.get('/config', (req, res) => {
    res.json({ success: true, discordOnlyAdmin: !!process.env.ADMIN_DISCORD_ID });
  });

  router.post('/logout', ensureAdmin, (req, res) => {
    req.session.isAdmin = false;
    res.json({ success: true });
  });

  router.get('/me', (req, res) => {
    const adminDiscordId = getAdminDiscordId();
    const currentUserId = req.user ? String(req.user.id).trim() : null;
    if (adminDiscordId && req.isAuthenticated && req.isAuthenticated() && currentUserId && currentUserId === adminDiscordId) {
      req.session.isAdmin = true;
      return res.json({ success: true, isAdmin: true, user: req.user });
    }
    res.json({ success: true, isAdmin: !!(req.session && req.session.isAdmin), user: req.user || null });
  });

  // Helper endpoint for detecting current Discord user (for admin setup)
  router.get('/detect', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const adminDiscordId = getAdminDiscordId();
      const currentUserId = String(req.user.id).trim();
      const user = { id: currentUserId, username: req.user.username, discriminator: req.user.discriminator };
      if (adminDiscordId && currentUserId === adminDiscordId) {
        req.session.isAdmin = true;
        return res.json({ success: true, admin: true, user });
      }
      return res.json({ success: true, admin: false, user });
    }
    return res.json({ success: false, user: null });
  });
  router.get('/users', ensureAdmin, (req, res) => {
    try {
      const users = getAllUsers();
      res.json({ success: true, users });
    } catch (err) {
      console.error('Error fetching users for admin:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/set-plan', ensureAdmin, (req, res) => {
    const { userId, plan, customDays } = req.body || {};
    const allowed = ['free', 'premium-week', 'premium-month', 'premium-custom'];
    if (!userId || !plan || !allowed.includes(plan)) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }
    try {
      setUserPlan(userId, plan, customDays);
      res.json({ success: true, data: { userId, plan, customDays } });
    } catch (err) {
      console.error('Error setting plan:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Serve admin page (protected) - client handles login form when not authenticated
  router.get('/', (req, res) => {
    if (!req.session || !req.session.isAdmin) {
      return res.sendFile(path.join(clientDir, 'admin.html'));
    }
    return res.sendFile(path.join(clientDir, 'admin.html'));
  });

  return router;
};
