const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const Product = require("../models/Product"); // ✅ For stock updates
const { client } = require("../utils/paypal");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// Admin check middleware
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  res.status(403).json({ message: "Admin access required" });
};

// Create new order (authenticated)
router.post("/", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "No order items" });
    }

    // Check stock availability first
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      }
      if (product.countInStock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: `Insufficient stock for product ${product.name}` });
      }
    }

    // Create order
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

    const createdOrder = await order.save({ session });

    // Decrement stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      product.countInStock -= item.quantity;
      await product.save({ session });
    }

    // Notification for new order
    await Notification.create(
      [
        {
          userId: req.user.id,
          orderId: createdOrder._id,
          message: `Your order #${createdOrder._id
            .toString()
            .slice(-6)
            .toUpperCase()} has been placed successfully.`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get logged-in user orders
router.get("/myorders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: "orderItems.product",
        select: "name images price",
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order by ID (auth, owner/admin)
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
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders (admin)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark order as paid
router.put("/:id/pay", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || "",
      status: req.body.status || "",
      update_time: req.body.update_time || "",
      email_address: req.body.email_address || "",
    };

    const updatedOrder = await order.save();

    // Notification
    await Notification.create({
      userId: order.user,
      orderId: order._id,
      message: `Your order #${order._id
        .toString()
        .slice(-6)
        .toUpperCase()} has been marked as paid.`,
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error marking order as paid:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark order as delivered (admin)
router.put(
  "/:id/deliver",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();

      // Notification
      await Notification.create({
        userId: order.user,
        orderId: order._id,
        message: `Your order #${order._id
          .toString()
          .slice(-6)
          .toUpperCase()} has been delivered.`,
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update order status (admin)
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    // Notification
    await Notification.create({
      userId: order.user,
      orderId: order._id,
      message: `Your order #${order._id
        .toString()
        .slice(-6)
        .toUpperCase()} status updated to ${status}.`,
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PayPal: Create order
router.post("/create-paypal-order", authMiddleware, async (req, res) => {
  try {
    const { totalPrice } = req.body;
    if (!totalPrice) {
      return res.status(400).json({ message: "Total price is required" });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalPrice.toFixed(2),
          },
        },
      ],
    });

    const order = await client().execute(request);
    const approveUrl = order.result.links.find(
      (link) => link.rel === "approve"
    );

    res.json({
      orderID: order.result.id,
      approveUrl: approveUrl ? approveUrl.href : null,
    });
  } catch (error) {
    console.error("PayPal create order error:", error);
    res.status(500).json({ message: "Error creating PayPal order" });
  }
});

// PayPal: Capture
router.post(
  "/capture-paypal-order/:orderId",
  authMiddleware,
  async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(
        orderId
      );
      request.requestBody({});

      const capture = await client().execute(request);
      res.json(capture.result);
    } catch (error) {
      console.error("PayPal capture payment error:", error);
      res.status(500).json({ message: "Error capturing PayPal payment" });
    }
  }
);

module.exports = router;
