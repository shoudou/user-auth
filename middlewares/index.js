module.exports = {
  authenticateAdmin: require("./admin_auth"),
  authorizeAdmin: require("./admin_access"),
  authenticateUser: require("./user_auth"),
  authorizeUser: require("./user_access"),
};
