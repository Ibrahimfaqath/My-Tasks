// index.js
import { serveStatic } from "@hono/node-server/serve-static";
import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";

// Import controller functions
import { register, login, logout, getMe } from "./controllers/authController.js";
import { 
  createTodo, 
  getAllTodos, 
  updateTodoStatus, 
  deleteTodo 
} from "./controllers/todoController.js";

const app = new Hono();

// API Registrasi
app.post("api/register", register);

// API LOGIN
app.post("/api/login", login);

// API LOGOUT
app.post("/api/logout", logout);

// API GET ME
app.get("/api/me", getMe);

// API Menambah Todo
app.post("/api/todos", createTodo);

// API Melihat Semua Todo Milik User
app.get("/api/todos", getAllTodos);

// API Edit Todos
app.put("/api/todos/:id/status", updateTodoStatus);

// API delete todo
app.delete("/api/todos/:id", deleteTodo);

// Serve Static - TIDAK BERUBAH
app.use("/*", serveStatic({ root: "./public" }));

if (process.env.VERCEL) {
  console.log("Running on Vercel");
  globalThis.app = app;
} else {
  const port = 5000;
  console.log(`✅ Server is running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}