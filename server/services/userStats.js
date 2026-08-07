const fs = require('fs');
const path = require('path');

const statsFile = path.join(__dirname, '..', 'stats.json');
const userStats = {};

function loadStats() {
  try {
    if (fs.existsSync(statsFile)) {
      const data = fs.readFileSync(statsFile, 'utf-8');
      const parsed = JSON.parse(data);
      Object.assign(userStats, parsed);
      
      // Migration: Ensure lastFreePlanConversionAt exists for all existing users
      let migrated = false;
      Object.keys(userStats).forEach((userId) => {
        if (!userStats[userId].lastFreePlanConversionAt) {
          userStats[userId].lastFreePlanConversionAt = null;
          migrated = true;
        }
        if (!userStats[userId].username) {
          userStats[userId].username = null;
          migrated = true;
        }
        if (!userStats[userId].avatar) {
          userStats[userId].avatar = null;
          migrated = true;
        }
        if (!userStats[userId].discriminator) {
          userStats[userId].discriminator = null;
          migrated = true;
        }
        if (userStats[userId].claimedFreePremium === undefined) {
          userStats[userId].claimedFreePremium = true;
          migrated = true;
        }
        if (userStats[userId].robloxApiKey === undefined) {
          userStats[userId].robloxApiKey = null;
          migrated = true;
        }
        if (userStats[userId].robloxTargetId === undefined) {
          userStats[userId].robloxTargetId = null;
          migrated = true;
        }
        if (userStats[userId].robloxTargetType === undefined) {
          userStats[userId].robloxTargetType = 'user';
          migrated = true;
        }
      });
      
      if (migrated) {
        saveStats();
      }
    }
  } catch (err) {
    console.error('Error loading user stats:', err);
  }
}

function saveStats() {
  try {
    fs.writeFileSync(statsFile, JSON.stringify(userStats, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving user stats:', err);
  }
}

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getNextLoginOrder() {
  const orders = Object.values(userStats)
    .map(user => Number(user.loginOrder))
    .filter(order => Number.isInteger(order) && order > 0);
  return orders.length ? Math.max(...orders) + 1 : 1;
}

function ensureUser(userId, userData = {}) {
  if (!userStats[userId]) {
    userStats[userId] = {
      monthly: {},
      lastConversionAt: null,
      lastFreePlanConversionAt: null, // Track free plan conversions separately
      plan: 'free',
      planExpiresAt: null,
      planStartedAt: null,
      loginOrder: getNextLoginOrder(),
      firstLoginAt: Date.now(),
      username: userData.username || null,
      avatar: userData.avatar || null,
      discriminator: userData.discriminator || null,
      claimedFreePremium: false,
      robloxApiKey: null,
      robloxTargetId: null,
      robloxTargetType: 'user'
    };
    saveStats();
  } else {
    const user = userStats[userId];
    if (!user.loginOrder) {
      user.loginOrder = getNextLoginOrder();
      if (!user.firstLoginAt) user.firstLoginAt = Date.now();
      saveStats();
    }
    if (!user.firstLoginAt) {
      user.firstLoginAt = Date.now();
      saveStats();
    }
    // Update Discord profile info on each login
    if (userData.username) user.username = userData.username;
    if (userData.avatar) user.avatar = userData.avatar;
    if (userData.discriminator) user.discriminator = userData.discriminator;
    if (userData.username || userData.avatar || userData.discriminator) {
      saveStats();
    }
  }
  return userStats[userId];
}

const FREE_PLAN_MAX_DURATION_SECONDS = 8 * 60;
const FREE_PLAN_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const PREMIUM_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const PREMIUM_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function isPremiumExpired(user) {
  if (!user || !user.plan || user.plan === 'free') return false;
  if (!user.planExpiresAt) return false;
  return Date.now() > Number(user.planExpiresAt);
}

function ensurePlanValidity(userId) {
  const user = ensureUser(userId);
  if (userId === 'local-user-id') {
    user.plan = 'premium-custom';
    user.planExpiresAt = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;
    user.planStartedAt = Date.now();
  } else if (user.plan !== 'free' && isPremiumExpired(user)) {
    user.plan = 'free';
    user.planExpiresAt = null;
    user.planStartedAt = null;
    saveStats();
  }
  return user;
}

function getUserConversionsThisMonth(userId) {
  const user = ensureUser(userId);
  const monthKey = getMonthKey();
  return user.monthly[monthKey] || 0;
}

function getUserPlan(userId) {
  const user = ensurePlanValidity(userId);
  return user.plan || 'free';
}

function isFreePlan(userId) {
  return getUserPlan(userId) === 'free';
}

function getLastConversionAt(userId) {
  const user = ensurePlanValidity(userId);
  return user.lastConversionAt;
}

function getUserDetails(userId) {
  const user = ensurePlanValidity(userId);
  return {
    plan: user.plan || 'free',
    planExpiresAt: user.planExpiresAt || null,
    planStartedAt: user.planStartedAt || null,
    lastConversionAt: user.lastConversionAt || null,
    lastFreePlanConversionAt: user.lastFreePlanConversionAt || null,
    conversionsThisMonth: user.monthly[getMonthKey()] || 0,
    loginOrder: user.loginOrder || null,
    firstLoginAt: user.firstLoginAt || null,
    status: user.plan === 'free' ? 'free' : (isPremiumExpired(user) ? 'expired' : 'active'),
    claimedFreePremium: user.claimedFreePremium || false,
    hasRobloxConnected: !!user.robloxApiKey,
    robloxTargetId: user.robloxTargetId || null,
    robloxTargetType: user.robloxTargetType || 'user'
  };
}

function canConvertNow(userId) {
  const user = ensurePlanValidity(userId);
  if (!user || user.plan === 'free') {
    // Gunakan lastFreePlanConversionAt untuk free plan cooldown
    const last = user.lastFreePlanConversionAt;
    if (!last) return true;
    const elapsed = Date.now() - last;
    return elapsed >= FREE_PLAN_COOLDOWN_MS;
  }
  return true;
}

function secondsUntilNextConversion(userId) {
  const user = ensurePlanValidity(userId);
  if (!user || user.plan !== 'free') return 0;
  const last = user.lastFreePlanConversionAt; // Gunakan free plan counter
  if (!last) return 0;
  const elapsed = Date.now() - last;
  const remaining = FREE_PLAN_COOLDOWN_MS - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

function recordConversion(userId) {
  const user = ensurePlanValidity(userId);
  const monthKey = getMonthKey();
  user.monthly[monthKey] = (user.monthly[monthKey] || 0) + 1;
  user.lastConversionAt = Date.now(); // Track semua konversi
  
  // Jika free plan, update free plan counter juga
  if (user.plan === 'free') {
    user.lastFreePlanConversionAt = Date.now();
  }
  
  saveStats();
}

function setUserPlan(userId, plan, customDays) {
  const user = ensureUser(userId);
  user.plan = plan || 'free';
  if (plan === 'premium-week') {
    user.planStartedAt = Date.now();
    user.planExpiresAt = Date.now() + PREMIUM_WEEK_MS;
  } else if (plan === 'premium-month') {
    user.planStartedAt = Date.now();
    user.planExpiresAt = Date.now() + PREMIUM_MONTH_MS;
  } else if (plan === 'premium-custom') {
    user.planStartedAt = Date.now();
    const days = parseInt(customDays) || 1;
    user.planExpiresAt = Date.now() + (days * 24 * 60 * 60 * 1000);
  } else {
    user.planStartedAt = null;
    user.planExpiresAt = null;
  }
  saveStats();
}

function claimFreePremium(userId) {
  const user = ensureUser(userId);
  if (user.claimedFreePremium) {
    return { success: false, error: 'Already claimed' };
  }
  user.claimedFreePremium = true;
  setUserPlan(userId, 'premium-custom', 1);
  return { success: true };
}

function getAllUsers() {
  return Object.keys(userStats).map((id) => {
    const u = ensurePlanValidity(id);
    return {
      id,
      username: u.username || null,
      avatar: u.avatar || null,
      discriminator: u.discriminator || null,
      plan: u.plan || 'free',
      planStartedAt: u.planStartedAt || null,
      planExpiresAt: u.planExpiresAt || null,
      status: u.plan === 'free' ? 'free' : (isPremiumExpired(u) ? 'expired' : 'active'),
      lastConversionAt: u.lastConversionAt || null,
      lastFreePlanConversionAt: u.lastFreePlanConversionAt || null,
      monthly: u.monthly || {},
      conversionsThisMonth: u.monthly[getMonthKey()] || 0,
      loginOrder: u.loginOrder || null,
      firstLoginAt: u.firstLoginAt || null,
      claimedFreePremium: u.claimedFreePremium || false
    };
  });
}

function setRobloxConfig(userId, config) {
  const user = ensureUser(userId);
  if (config.apiKey !== undefined) user.robloxApiKey = config.apiKey;
  if (config.targetId !== undefined) user.robloxTargetId = config.targetId;
  if (config.targetType !== undefined) user.robloxTargetType = config.targetType;
  saveStats();
}

function clearRobloxConfig(userId) {
  const user = ensureUser(userId);
  user.robloxApiKey = null;
  user.robloxTargetId = null;
  user.robloxTargetType = 'user';
  saveStats();
}

function getRobloxConfig(userId) {
  const user = ensureUser(userId);
  return {
    apiKey: user.robloxApiKey || null,
    targetId: user.robloxTargetId || null,
    targetType: user.robloxTargetType || 'user'
  };
}

loadStats();

module.exports = {
  ensureUser,
  getUserConversionsThisMonth,
  getUserPlan,
  isFreePlan,
  getLastConversionAt,
  canConvertNow,
  secondsUntilNextConversion,
  recordConversion,
  setUserPlan,
  getUserDetails,
  getAllUsers,
  claimFreePremium,
  FREE_PLAN_MAX_DURATION_SECONDS,
  setRobloxConfig,
  clearRobloxConfig,
  getRobloxConfig
};
