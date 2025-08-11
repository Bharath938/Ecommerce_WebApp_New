const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

router.get("/", async (req, res) => {
  console.log("hi");
  try {
    const categories = await Category.find({});
    console.log(categories);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to load categories" });
  }
});

module.exports = router;
