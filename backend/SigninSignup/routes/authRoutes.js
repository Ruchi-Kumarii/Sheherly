import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

import { signup, signin } from "../controllers/authController.js";
import { changePassword, deleteAccount } from "../controllers/authController.js";
import { getAllUsers } from "../controllers/authController.js";

const router = express.Router();
router.get("/users", getAllUsers);
router.post("/signup", signup);
router.post("/signin", signin);

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});
router.post("/change-password", auth, changePassword);
router.delete("/delete-account", auth, deleteAccount);


router.patch("/update-profile", auth, async (req, res) => {
  try {
    console.log("PATCH /update-profile body keys:", Object.keys(req.body));
    console.log("Authenticated userId:", req.userId);
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
