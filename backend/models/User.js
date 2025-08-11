// models/User.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: true } // keeps unique IDs for each address
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // Multiple saved addresses
    shippingAddresses: {
      type: [addressSchema],
      default: [],
      validate: [arrayLimit, "{PATH} exceeds the limit of 10"],
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 10;
}

module.exports = mongoose.model("User", UserSchema);
