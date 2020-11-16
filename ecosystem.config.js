module.exports = {
  apps : [{
    name: 'ohorime',
    script: './index.js',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],
};