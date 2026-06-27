import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runProcess(name, command, args, cwd) {
  console.log(`🚀 Starting ${name}...`);

  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: false, // ✅ fixes shell warning
  });

  child.on("close", (code) => {
    console.log(`❌ ${name} stopped with code ${code}`);
  });

  child.on("error", (err) => {
    console.error(`🔥 Failed to start ${name}:`, err.message);
  });
}

// =========================
// Start all your backends
// =========================


// 3. Admin backend
runProcess(
  "Admin Backend",
  "node",
  ["server.js"],
  path.join(__dirname, "admin")
);

// 4. Search backend (Flask)
runProcess(
  "Search Backend",
  "python",
  ["search.py"],
  path.join(__dirname, "search")
);

// 5. Chatbot backend (FastAPI)
runProcess(
  "Chatbot Backend",
  "python",
  ["-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"],
  __dirname   // 🔥 IMPORTANT: backend folder
);
