const bcrypt = require("bcryptjs");
const User = require("../models/User");

// 🔁 Update profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, avatar } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "Name and email required" });

    user.name = name;
    user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 Change password
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const { oldPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🗑 Delete account
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🖼 Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Avatar uploaded",
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  updateProfile,
  changePassword,
  deleteAccount,
  uploadAvatar,
};
