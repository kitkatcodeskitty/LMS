import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const createAccessToken = (user) => {
  const data = {
    id: user._id,
    email: user.email,
    isAdmin: user.isAdmin,
    isSubAdmin: user.isSubAdmin,
    role: user.role,
  };
  return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
};

export const verify = (req, res, next) => {
  let token = req.headers.authorization;

  if (typeof token === "undefined") {
    return res.status(403).send({ auth: "Failed. No Token" });
  } else {
    token = token.slice(7, token.length);

    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decodedToken) {
      if (err) {
        return res.status(403).send({ auth: "Failed" });
      } else {
        req.user = decodedToken;
        next();
      }
    });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    return res.status(403).send({
      auth: "Failed",
      message: "Action Forbidden",
    });
  }
};

// Verify admin or sub-admin for limited admin functions
export const verifyAdminOrSubAdmin = (req, res, next) => {
  if (req.user.isAdmin || req.user.isSubAdmin || req.user.role === 'admin' || req.user.role === 'subadmin') {
    next();
  } else {
    return res.status(403).send({
      auth: "Failed",
      message: "Action Forbidden - Admin or Sub-Admin access required",
    });
  }
};

// Error handler middleware (adapted for async catch)
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const errorMessage = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: {
      message: errorMessage,
      errorCode: err.code || "SERVER_ERROR",
      details: err.details || null,
    },
  });
};
