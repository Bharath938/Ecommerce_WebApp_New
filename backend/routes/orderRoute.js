const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Order = require("../models/Order");

// Create new order (authenticated)

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Get logged-in user orders
router.get("/myorders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    console.log("Orders found:", orders.length);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order by ID (authenticated, owner or admin)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders (admin only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark order as paid
router.put("/:id/pay", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only the user who placed the order or admin can mark it paid
    if (order.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || "", // Payment ID from gateway
      status: req.body.status || "", // Payment status
      update_time: req.body.update_time || "",
      email_address: req.body.email_address || "",
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error marking order as paid:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark order as delivered
router.put("/:id/deliver", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only admin can mark an order as delivered
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error marking order as delivered:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
