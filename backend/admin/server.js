import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import nodemailer from "nodemailer";
import dataRoutes from "./routes/dataRoutes.js";

// Load .env — works locally (backend/.env); on Render, env vars are injected by the platform
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

// ── Customer Support — send auto-reply to user + notify support inbox ──
app.post("/api/admin/support-email", async (req, res) => {
  const { userEmail, category, description } = req.body;

  if (!userEmail || !category || !description) {
    return res.status(400).json({ message: "userEmail, category, and description are required" });
  }

  // Guard: make sure env vars are actually loaded
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("SUPPORT EMAIL ERROR: GMAIL_USER or GMAIL_APP_PASSWORD env var is missing");
    return res.status(500).json({ message: "Email service not configured on server." });
  }

  console.log(`[support-email] Request from ${userEmail}, category: ${category}`);
  console.log(`[support-email] Sending via GMAIL_USER: ${process.env.GMAIL_USER}`);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 1️⃣  Auto-reply to the user
    await transporter.sendMail({
      from: `"Sheherly Support" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: "We received your support request — Sheherly",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; color: #1e293b;">
          <div style="background: #218fb4; padding: 28px 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Sheherly Support</h1>
            <p style="color: #e0f2fe; margin: 6px 0 0; font-size: 14px;">We've got your message</p>
          </div>
          <div style="background: #f8fafc; padding: 28px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 8px;">Hi there,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.7;">
              Thank you for contacting Sheherly Support. We've received your request and our team
              will look into your problem as soon as possible.
            </p>

            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Your Request Summary</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Category:</strong> ${category}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Description:</strong> ${description}</p>
            </div>

            <p style="font-size: 14px; color: #475569; line-height: 1.7;">
              We typically respond within <strong>24 hours</strong>. If your issue is urgent,
              you can also reply directly to this email.
            </p>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px;">
              <p style="font-size: 13px; color: #94a3b8; margin: 0;">
                This is an automated confirmation. Please do not reply to this message if
                you have additional details — use the app's support form to submit a new request.
              </p>
            </div>

            <p style="margin-top: 20px; font-size: 14px;">
              Warm regards,<br/>
              <strong style="color: #218fb4;">Team Sheherly</strong>
            </p>
          </div>
        </div>
      `,
    });

    // 2️⃣  Notify the support inbox so the team sees it
    await transporter.sendMail({
      from: `"Sheherly App" <${process.env.GMAIL_USER}>`,
      to: "kiro21223@gmail.com",
      subject: `[Support Request] ${category} — from ${userEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; color: #1e293b;">
          <h2 style="color: #218fb4;">New Support Request</h2>
          <p><strong>From:</strong> ${userEmail}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Description:</strong></p>
          <div style="background: #f8fafc; border-left: 4px solid #218fb4; padding: 12px 16px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${description}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">Auto-reply has been sent to the user.</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("SUPPORT EMAIL ERROR:", err.message);
    console.error("SUPPORT EMAIL ERROR code:", err.code);
    console.error("SUPPORT EMAIL ERROR response:", err.response);
    return res.status(500).json({ message: "Failed to send support email.", detail: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Admin Backend Running");
});

const PORT = process.env.ADMIN_PORT || 9000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Admin server running on port ${PORT}`);
});