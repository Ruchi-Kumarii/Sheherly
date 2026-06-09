import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./db.js";
import authRoutes from "./routes/authRoutes.js";

// Load shared .env from backend/
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Debug logger → shows every request coming in
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// 404 handler (optional but useful)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler (optional but useful)
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.AUTH_PORT || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});