const prod_keys = {
  APP_NAME: process.env.APP_NAME,
  BASE_URL: process.env.BASE_URL,
  API_BASE_URL: process.env.API_BASE_URL,
  CLIENT_BASE_URL: process.env.CLIENT_BASE_URL,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  PORT: process.env.PORT
};

if (process.env.NODE_ENV === "production") module.exports = prod_keys;
else if (process.env.NODE_ENV === "test")
  module.exports = require("./test_keys");
else module.exports = require("./dev_keys");
