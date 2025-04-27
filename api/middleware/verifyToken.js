import jwt from "jsonwebtoken";
import { User } from "../model/user.js";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid token payload" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Unauthorized - User not found" });
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.log("Token verification error:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized - Invalid or expired token" });
  }
};