// backend/src/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

// role check
export const authorize = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};
