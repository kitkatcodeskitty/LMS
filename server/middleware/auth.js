import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Middleware to authenticate JWT token
export const authenticateToken = (req, res, next) => {
  let token = req.headers.authorization;

  if (typeof token === "undefined") {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. No token provided." 
    });
  }

  // Remove "Bearer " prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      message: "Invalid or expired token." 
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. User not authenticated." 
    });
  }

  if (req.user.isAdmin || req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Admin privileges required." 
    });
  }
};

// Middleware to check if user is admin or sub-admin
export const isAdminOrSubAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. User not authenticated." 
    });
  }

  if (req.user.isAdmin || req.user.isSubAdmin || req.user.role === 'admin' || req.user.role === 'subadmin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Admin or Sub-Admin privileges required." 
    });
  }
};
