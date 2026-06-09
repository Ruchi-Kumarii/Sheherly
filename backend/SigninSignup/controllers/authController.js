import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { promises as dns } from "dns";

// ---------- lazy transporter — reads env vars at call time ----------
const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

// ---------- random password generator ----------
const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// ---------- check email domain has valid MX records ----------
const isEmailDomainValid = async (email) => {
  try {
    const domain = email.split("@")[1];
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
};

export const signup = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  console.log("SIGNUP REQUEST:", normalizedEmail);

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check duplicate
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate email domain via MX lookup before attempting anything
    const domainValid = await isEmailDomainValid(normalizedEmail);
    if (!domainValid) {
      console.log("INVALID EMAIL DOMAIN:", normalizedEmail);
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Generate plain-text password
    const plainPassword = generatePassword();

    // Try sending email BEFORE saving user
    try {
      await getTransporter().sendMail({
        from: `"Sheherly App" <${process.env.GMAIL_USER}>`,
        to: normalizedEmail,
        subject: "Your Sheherly Account Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
            <h2 style="color: #218fb4;">Welcome to Sheherly!</h2>
            <p>Your account has been created. Here is your login password:</p>
            <div style="background: #f0f8ff; padding: 16px; border-radius: 8px; text-align: center;">
              <h2 style="letter-spacing: 4px; color: #085a73;">${plainPassword}</h2>
            </div>
            <p style="color: #888; font-size: 13px; margin-top: 16px;">
              Please keep this safe. You can change your password from your profile settings.
            </p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("MAIL ERROR:", mailErr.message);
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Email sent — now save user
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};


export const signin = async (req, res) => {
  const { email, password } = req.body;

  console.log("SIGNIN REQUEST RECEIVED");
  console.log("Email:", email);

  try {
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("SIGNIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Signin failed",
    });
  }
};


export const changePassword = async (req, res) => {
  try {
    console.log("CHANGE PASSWORD HIT");
    console.log("USER ID:", req.userId);

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD CRASH:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const deleteAccount = async (req, res) => {
  try {
    console.log("DELETE USER ID:", req.userId);

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(req.userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    return res.status(500).json({ message: "Failed to delete account" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


