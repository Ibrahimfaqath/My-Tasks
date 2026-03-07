import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie, getCookie } from "hono/cookie";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

// API Registrasi
export const register = async (c) => {
  try {
    const { username, password } = await c.req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db
      .insert(users)
      .values({ username, password: hashedPassword })
      .returning({ id: users.id, username: users.username });

    return c.json({ success: true, data: newUser[0] }, 201);
  } catch (error) {
    console.error("Register Error:", error);
    return c.json({ success: false, message: "Register gagal" }, 400);
  }
};

// API LOGIN
export const login = async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // Mencari user
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    });

    if (!user) {
      return c.json({ success: false, message: "Username atau password salah" }, 401);
    }

    // Validasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return c.json({ success: false, message: "Username atau password salah" }, 401);
    }

    // Generate Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set Cookie dengan Path "/" agar bisa diakses rute lain
    setCookie(c, "token", token, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 3600,
      path: "/", 
    });

    return c.json({ success: true, message: "Login berhasil" });
  } catch (error) {
    return c.json({ success: false, message: "Login error" }, 500);
  }
};

// API LOGOUT
export const logout = (c) => {
  setCookie(c, "token", "", { 
    maxAge: -1,
    path: "/",
  });
  return c.json({ success: true, message: "Logout berhasil" });
};

// API GET ME
export const getMe = (c) => {
  const token = getCookie(c, "token");
  if (!token) return c.json({ success: false, message: "Unauthorized" }, 401);
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return c.json({ success: true, data: user });
  } catch (error) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
};