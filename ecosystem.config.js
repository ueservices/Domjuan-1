module.exports = {
    apps: [
        {
            name: 'domjuan-bot-system',
            script: 'server.js',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'development',
                PORT: 3000,
                AUTO_RESTART_BOTS: 'true',
                EXPORT_INTERVAL_MS: '300000',
                MAX_CONSECUTIVE_ERRORS: '5'
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
                AUTO_RESTART_BOTS: 'true',
                EXPORT_INTERVAL_MS: '300000',
                MAX_CONSECUTIVE_ERRORS: '5'
            },
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_file: './logs/pm2-combined.log',
            time: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            restart_delay: 4000,
            kill_timeout: 5000,
            listen_timeout: 8000,
            health_check_grace_period: 30000,
            cron_restart: '0 4 * * *', // Restart daily at 4 AM
            ignore_watch: ['node_modules', 'data', 'logs', '*.log'],
            // Auto-restart if memory usage exceeds threshold
            // (Note: max_memory_restart already set above)
            // Monitoring
            monitoring: true
        }
    ],

    deploy: {
        production: {
            user: 'deploy',
            host: 'your-server.com',
            ref: 'origin/main',
            repo: 'https://github.com/ueservices/Domjuan-1.git',
            path: '/var/www/domjuan-bot-system',
            'pre-deploy': 'git reset --hard',
            'post-deploy':
                'npm install --production && pm2 reload ecosystem.config.js --env production',
            'pre-setup':
                'mkdir -p /var/www/domjuan-bot-system/data /var/www/domjuan-bot-system/logs'
        }
    }
};
