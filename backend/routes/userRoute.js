const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user); // send all safe fields: _id, name, email, shippingAddresses, etc.
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      shippingAddresses: updatedUser.shippingAddresses || [],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// @desc    Get all shipping addresses
// @route   GET /api/users/shipping-addresses
// @access  Private
router.get("/shipping-addresses", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.shippingAddresses || []);
  } catch (error) {
    console.error("Error fetching shipping addresses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Add a new shipping address
// @route   POST /api/users/shipping-addresses
// @access  Private
router.post("/shipping-addresses", authMiddleware, async (req, res) => {
  try {
    const { fullName, address, city, postalCode, country, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.shippingAddresses)) {
      user.shippingAddresses = [];
    }

    if (user.shippingAddresses.length >= 10) {
      return res
        .status(400)
        .json({ message: "Maximum number of addresses (10) reached" });
    }

    user.shippingAddresses.push({
      fullName,
      address,
      city,
      postalCode,
      country,
      phone,
    });

    await user.save();
    res.status(201).json(user.shippingAddresses);
  } catch (error) {
    console.error("Error adding shipping address:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete a shipping address
// @route   DELETE /api/users/shipping-addresses/:addressId
// @access  Private
router.delete(
  "/shipping-addresses/:addressId",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.shippingAddresses = user.shippingAddresses.filter(
        (addr) => addr._id.toString() !== req.params.addressId
      );

      await user.save();
      res.json(user.shippingAddresses);
    } catch (error) {
      console.error("Error deleting shipping address:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
