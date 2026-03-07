import jwt from "jsonwebtoken";
import { getCookie } from "hono/cookie";

export const verifyToken = (c) => {
  const token = getCookie(c, "token");
  
  if (!token) {
    console.log("VerifyToken: No token found in cookies");
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("VerifyToken: JWT Error", error.message);
    return null;
  }
};