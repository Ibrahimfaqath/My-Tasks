// index.js
import { serveStatic } from "@hono/node-server/serve-static"; // Tetap simpan jika masih ingin jalan di lokal
import "dotenv/config";
import { Hono } from "hono";
import { handle } from "hono/vercel"; // Import handler khusus Vercel
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

// --- API ROUTES ---
app.post("/api/register", register);
app.post("/api/login", login);
app.post("/api/logout", logout);
app.get("/api/me", getMe);
app.post("/api/todos", createTodo);
app.get("/api/todos", getAllTodos);
app.put("/api/todos/:id/status", updateTodoStatus);
app.delete("/api/todos/:id", deleteTodo);

// --- STATIC FILES ---
// Di Vercel, folder public biasanya ditangani oleh @vercel/static (sesuai vercel.json Anda)
// Tapi baris ini tetap berguna untuk development lokal
app.use("/*", serveStatic({ root: "./public" }));

// --- VERCEL & LOCAL HANDLER ---
if (process.env.VERCEL) {
  // Jika berjalan di Vercel, gunakan export default handle(app)
  console.log("Running on Vercel");
} else {
  // Jika berjalan di Lokal (node index.js)
  const port = 5000;
  console.log(`✅ Server is running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

// Bagian paling krusial untuk Vercel:
export default handle(app);