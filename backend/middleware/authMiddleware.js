// middleware/authMiddleware.js

module.exports = async (req, res, next) => {
  try {
    // Basic example: check for Authorization header, verify JWT token, set req.user
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    // Verify token here - e.g. using jwt.verify (you need to require jsonwebtoken)
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id, isAdmin: decoded.isAdmin };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
