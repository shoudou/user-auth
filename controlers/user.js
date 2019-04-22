const User = require("../models/User");

//middlewares
const { authenticateUser } = require("../middlewares/");

const get_user_from_token = async (req, res) => {
  try {
    const user = await User.findByToken("auth", req.token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unable to authenticate your request"
      });
    }

    return res.json({
      success: true,
      token: req.token,
      user: user.toAuthProfile()
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occured while processing your request"
    });
  }
};

const delete_token = async (req, res) => {
  try {
    await User.removeToken(req.token);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occured while processing your request"
    });
  }
};

const get_my_profile = async (req, res) => {
  return res.status(200).json({
    success: true,
    profile: req.user.toMyProfile()
  });
};

const get_dashboard = (req, res) => {
  return res.status(200).json({
    success: true,
    content: [
      {
        name: "Tasks",
        items:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis egestas maecenas pharetra convallis posuere. Diam volutpat"
      }
    ]
  });
};

const login_fetch_account = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByCredentials(email, password);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email address / Password invalid"
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occured while processing your request"
    });
  }
};

const post_login = async (req, res) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your account is not activated yet"
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is currently blocked. Please reset your password to continue"
      });
    }

    const token = await req.user.generateToken("auth");

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "The auth service is currently unavailable"
      });
    }
    return res.status(200).json({
      success: true,
      token,
      user: req.user.toAuthProfile()
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occured while processing your request"
    });
  }
};

const post_signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password, isAdmin } = req.body;

    const existingUser = await User.findOne({
      email
    });

    if (!existingUser) {
      const newUser = new User({
        firstname,
        lastname,
        email,
        password,
        isVerified: true,
        isAdmin
      });

      await newUser.save();

      return res.status(200).json({
        success: true,
        message: "You signed up successfully"
      });
    }
    return res.status(400).json({
      success: false,
      message: "This account already exists"
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
  app.get(`/api/user/auth`, authenticateUser, get_user_from_token);
  app.get(`/api/user/dashboard`, authenticateUser, get_dashboard);
  app.get(`/api/user/my-profile`, authenticateUser, get_my_profile);
  app.post(`/api/user/login`, login_fetch_account, post_login);
  app.post(`/api/user/signup`, post_signup);
  app.post(`/api/user/logout`, authenticateUser, delete_token);
};
