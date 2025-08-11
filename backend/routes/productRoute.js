const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

// Admin check middleware
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};

/**
 * @route   GET /api/products
 * @desc    Get all products (with optional search param)
 * @access  Public
 * Example: /api/products?search=phone
 */
router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query.search;
    let query = {};

    if (searchQuery) {
      // search in name or category fields
      query = {
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a product (Admin only)
 * @access  Private/Admin
 */
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      countInStock,
      images, // expects array of URLs
      category,
      isFeatured,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      countInStock,
      images,
      category,
      isFeatured,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product (Admin only)
 * @access  Private/Admin
 */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      name,
      description,
      price,
      countInStock,
      images, // expects array
      category,
      isFeatured,
    } = req.body;

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.countInStock = countInStock ?? product.countInStock;
    product.images = images ?? product.images;
    product.category = category ?? product.category;
    product.isFeatured = isFeatured ?? product.isFeatured;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (Admin only)
 * @access  Private/Admin
 */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (error) {
    console.error("Product deletion error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
