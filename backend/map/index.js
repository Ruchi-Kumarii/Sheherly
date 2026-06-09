import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load shared .env from backend/
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

console.log("1. Starting index.js...");

import { getRoute } from "./routeService.js";
console.log("2. routeService imported successfully");

import { searchPlace } from "./geocodingService.js";
console.log("3. geocodingService imported successfully");

const app = express();
console.log("4. Express app created");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Map backend running");
});

app.get("/api/search", async (req, res) => {
  try {
    const { place } = req.query;

    if (!place) {
      return res.status(400).json({
        success: false,
        error: "Place is required",
      });
    }

    const result = await searchPlace(place);

    if (!result.success) {
      return res.status(200).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("SEARCH API ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: "Unable to fetch coordinates",
    });
  }
});

app.post("/api/route", async (req, res) => {
  try {
    console.log("ROUTE HIT", req.body);

    const { source, destination, mode } = req.body;

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        error: "Source and destination required",
      });
    }

    const result = await getRoute(source, destination, mode);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("ROUTE API ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: "Unable to calculate route",
    });
  }
});

const PORT = process.env.MAP_PORT || 8002;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`5. Server running on port ${PORT}`);
});

process.on("exit", (code) => {
  console.log("❌ Process exiting with code:", code);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});