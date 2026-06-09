import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import nodemailer from "nodemailer";
import dataRoutes from "./routes/dataRoutes.js";

// Load shared .env from backend/
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin/data", dataRoutes);

// ── Send generated password to user email on signup ──────────
app.post("/api/admin/send-password", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Sheherly App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Sheherly Account Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #218fb4;">Welcome to Sheherly!</h2>
          <p>Your account has been created. Here is your login password:</p>
          <div style="background: #f0f8ff; padding: 16px; border-radius: 8px; text-align: center;">
            <h2 style="letter-spacing: 4px; color: #085a73;">${password}</h2>
          </div>
          <p style="color: #888; font-size: 13px; margin-top: 16px;">
            Please keep this safe. You can change your password from your profile settings.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("SEND PASSWORD EMAIL ERROR:", err.message);
    return res.status(500).json({ message: "Failed to send email. Please try again." });
  }
});

app.get("/", (req, res) => {
  res.send("Admin Backend Running");
});

const PORT = process.env.ADMIN_PORT || 9000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Admin server running on port ${PORT}`);
});