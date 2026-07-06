module.exports = {
  apps: [
    {
      name: "caradvice-frontend",
      cwd: "/var/www/caradvice/frontend",
      script: "npm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        NEXT_PUBLIC_API_URL: "https://api.caradvice.com.ar",
      },
      error_file: "/var/log/pm2/caradvice-frontend-error.log",
      out_file: "/var/log/pm2/caradvice-frontend-out.log",
      time: true,
    },
  ],
};
