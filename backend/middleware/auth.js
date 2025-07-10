const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
};

const checkActiveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("isActive email");

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
        accountDeactivated: true,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error checking user status:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying account status",
    });
  }
};

const checkActiveUserForOAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "isActive email firstName lastName",
    );

    if (!user || !user.isActive) {
      const frontendUrl = process.env.CLIENT_URL;
      const errorMessage = encodeURIComponent(
        "Account is deactivated. Please contact support.",
      );
      return res.redirect(
        `${frontendUrl}/signin?error=account_deactivated&message=${errorMessage}`,
      );
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error checking user status:", error);
    const frontendUrl = process.env.CLIENT_URL;
    const errorMessage = encodeURIComponent("Unable to verify account status.");
    return res.redirect(
      `${frontendUrl}/signin?error=server_error&message=${errorMessage}`,
    );
  }
};

module.exports = auth;
module.exports.adminOnly = adminOnly;
module.exports.checkActiveUser = checkActiveUser;
module.exports.checkActiveUserForOAuth = checkActiveUserForOAuth;
