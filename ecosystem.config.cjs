/** PM2 — usage sur VPS Hostinger : pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "bookflow",
      cwd: __dirname,
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "800M",
    },
  ],
};
