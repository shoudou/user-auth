const User = require("../models/User");

//middlewares
const { authenticateAdmin } = require("../middlewares");

const get_admin_from_token = async (req, res) => {
  try {
    const user = await User.findByToken("auth", req.token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your session must be expired"
      });
    }

    return res.status(200).json({
      success: true,
      token: req.token,
      user: user.toAuthProfile()
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occured while reverifying your request"
    });
  }
};

const delete_token = async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    return res.status(200).json({
      success: true,
      message: "You are logged out successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occured while logging you out."
    });
  }
};

const get_admin_profile = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user.toMyProfile()
  });
};

const login_fetch_admin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findByCredentials(username, password);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Username or/and Password"
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occured while signing you in"
    });
  }
};

const post_login = async (req, res) => {
  try {
    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is currently blocked. Please reset your password to gain access"
      });
    }

    const token = await req.user.generateToken("auth");

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Unable to log you in"
      });
    }

    return res.json({
      success: true,
      token,
      user: req.user.toAuthProfile()
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occured while signing you in"
    });
  }
};

const get_adminBoard = async (req, res) => {
  const content = [
    {
      _id: 1,
      description: "This is content of notification 1 from server"
    },
    {
      _id: 2,
      description: "This is content of notification 2 from server"
    },
    {
      _id: 3,
      description: "This is content of notification 3 from server"
    }
  ];
  return res.status(200).json({
    success: true,
    content: content
  });
};

const get_account_management = async (req, res) => {
  try {
    const accounts = await User.fetchAccounts();

    return res.status(200).json({
      success: true,
      accounts
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occured while processing your request"
    });
  }
};

module.exports = app => {
  //general routes
  app.get("/api/admin/adminBoard", authenticateAdmin, get_adminBoard);

  //admin own routes
  app.get(`/api/admin/auth`, authenticateAdmin, get_admin_from_token);

  app.post(`/api/admin/signin`, login_fetch_admin, post_login);
  app.post(`/api/admin/logout`, authenticateAdmin, delete_token);
  app.get(`/api/admin/profile`, authenticateAdmin, get_admin_profile);

  //accounts related
  app.get(
    "/api/admin/accounts-management",
    authenticateAdmin,
    get_account_management
  );
};
