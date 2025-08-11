// backend/routes/test.route.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: `Hello user ${req.user.id}, you accessed a protected route!`,
  });
});

module.exports = router;
