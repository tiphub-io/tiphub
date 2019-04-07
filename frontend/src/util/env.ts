// Any env var added here must also be added in webpack.config.js
const env = {
  SITE_URL: process.env.SITE_URL || 'https://tiphub.io',
  BACKEND_URL: process.env.BACKEND_URL || '',
};

export default env;
