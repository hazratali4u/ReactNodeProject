module.exports = {
  apps: [
    {
      name: 'school-api',
      script: './server/index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
    },
  ],
};
