// middleware/auth.js
import jwt from "jsonwebtoken";
import { getCookie } from "hono/cookie";

export const verifyToken = (c) => {
  const token = getCookie(c, "token");
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};