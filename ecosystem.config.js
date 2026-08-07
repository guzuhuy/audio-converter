module.exports = {
  apps: [
    {
      // ========================================
      // Main Express App (Frontend Serving + API)
      // ========================================
      name: 'audio-converter-api',
      script: './server/app.js',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },

      // Resource limits
      max_memory_restart: '500M',
      max_restarts: 10,
      min_uptime: '10s',

      // Auto-restart on file changes (development only)
      watch: false,
      ignore_watch: ['node_modules', 'uploads', 'outputs', 'temp', 'logs', 'server/stats.json', 'stats.json'],
      watch_delay: 1000,

      // Logging
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: false,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Health check
      cron_restart: '0 0 * * *', // Daily restart at midnight
      
      // Environment
      autorestart: true,
      max_exits: 3,
    }
  ],

  // ========================================
  // Global Settings
  // ========================================
  general: {
    // Log file location
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Error handling
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    
    // Cluster settings
    max_conns: 10000,
    max_sockets: 1000,
    
    // Node settings
    node_args: [
      '--max-old-space-size=2048', // 2GB max heap
      '--abort-on-uncaught-exception',
    ],
  },

  // ========================================
  // Monitoring & Alerts
  // ========================================
  monitor_interval: 5000,
  
  // Environment-specific settings
  env_production: {
    instances: 1,
    watch: false, // Disable watch in production
    ignore_watch: ['node_modules', 'uploads', 'outputs', 'temp', 'logs', 'server/stats.json', 'stats.json'],
  },

  // ========================================
  // Post-Start/Stop Scripts (Optional)
  // ========================================
  post_update: [
    'npm install',
    'npm run build',
  ],

  listen_timeout: 5000,
  kill_timeout: 5000,
};
