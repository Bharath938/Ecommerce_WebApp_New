// backend/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const userRoutes = require("./routes/userRoute");
const notificationRoute = require("./routes/notificationRoute");
const categoryRoute = require("./routes/categoryRoute");

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Mount routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/categories", categoryRoute);

// Root route
app.get("/", (req, res) => res.send("QuickBasket API is running"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
