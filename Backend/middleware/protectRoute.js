import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      //Either Token expired or Tempered
      return res.status(401).json({ erorr: "Unauthorized: Invalid Token" });
    }
    // const user = await User.findOne(decoded.userId).select("-password");
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in ProtectRoute MiddleWare", error.message);
    return res.status(500).json({ erorr: "Internal Server Error" });
  }
};
