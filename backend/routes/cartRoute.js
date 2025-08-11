const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware); // All cart routes require login

// ✅ Get user cart
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    res.json({ items: cart ? cart.items : [] });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add or update (set quantity) in cart
router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (itemIndex > -1) {
        // ❗ Now overwrites quantity instead of incrementing
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    await cart.populate("items.product");

    const addedItem = cart.items.find(
      (i) => i.product._id.toString() === productId
    );

    res.json(addedItem);
  } catch (error) {
    console.error("Add/update cart item error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update quantity of existing item
router.put("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");

    res.json(item);
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Remove a single item from cart
router.delete("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.product");

    res.json({ items: cart.items });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Clear entire cart (matches clearCartOnServer thunk)
router.delete("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared", items: [] });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
