import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = function (token, type = "access") {
  try {
    const secret = type === "access" ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const generateAccessToken = function (user) {
   return jwt.sign(
      { id: user._id, roleId: user.roleId, name: user.name },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );
};
export const generateRefreshToken = function (user) {
   return jwt.sign(
      { id: user._id, roleId: user.roleId, name: user.name },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
};

