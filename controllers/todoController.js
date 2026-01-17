// controllers/todoController.js
import { db } from "../db/index.js";
import { todos } from "../db/schema.js";
import jwt from "jsonwebtoken";
import { getCookie } from "hono/cookie";
import { and, eq } from "drizzle-orm";

// Helper untuk verifikasi token (sama seperti di kode asli)
const verifyTokenFromCookie = (c) => {
  const token = getCookie(c, "token");
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// API Menambah Todo - TIDAK BERUBAH
export const createTodo = async (c) => {
  const token = getCookie(c, "token");
  if (!token) return c.json({ success: false, message: "Unauthorized" }, 401);
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { note } = await c.req.json();
    const newTodo = await db
      .insert(todos)
      .values({ note, userId: user.id })
      .returning();
    return c.json({ success: true, data: newTodo[0] }, 201);
  } catch (error) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
};

// API Melihat Semua Todo Milik User - TIDAK BERUBAH
export const getAllTodos = async (c) => {
  const token = getCookie(c, "token");
  if (!token) return c.json({ success: false, message: "Unauhorized" }, 401);
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const userTodos = await db.query.todos.findMany({
      where: (todos, { eq }) => eq(todos.userId, user.id),
    });
    return c.json({ success: true, data: userTodos });
  } catch (error) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
};

// API Edit Todos - TIDAK BERUBAH
export const updateTodoStatus = async (c) => {
  const token = getCookie(c, "token");
  if (!token) return c.json({ success: false, message: "Unauthorized" }, 401);

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const id = parseInt(c.req.param("id"));
    const { status } = await c.req.json();

    const updatedTodo = await db
      .update(todos)
      .set({ status })
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
      .returning();

    if (updatedTodo.length === 0)
      return c.json({ success: false, message: "Todo not found" }, 404);
    return c.json({ success: true, data: updatedTodo[0] });
  } catch (error) {
    return c.json({ success: "false", message: "Unauthorized" }, 401);
  }
};

// API delete todo - TIDAK BERUBAH
export const deleteTodo = async (c) => {
  const token = getCookie(c, "token");
  if (!token) return c.json({ success: false, message: "Unauthorized" }, 401);

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const id = parseInt(c.req.param("id"));

    const deletedTodo = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
      .returning();

    if (deletedTodo.length === 0)
      return c.json({ success: false, message: "Todo not found" }, 404);
    return c.json({ success: true, message: "Todo deleted" });
  } catch (error) {
    return c.json({ success: "false", message: "Unauthorized" }, 401);
  }
};