const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const sampleProducts = [
  {
    name: "Classic Leather Shoes",
    description: "Elegant and comfortable leather shoes for any occasion.",
    price: 79.99,
    countInStock: 10,
    imageUrl: "https://example.com/images/shoes1.jpg",
    category: "Footwear",
    isFeatured: true,
  },
  {
    name: "Slim Fit T-Shirt",
    description: "Soft cotton slim fit t-shirt in multiple colors.",
    price: 19.99,
    countInStock: 50,
    imageUrl: "https://example.com/images/tshirt1.jpg",
    category: "Clothing",
    isFeatured: false,
  },
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation.",
    price: 129.99,
    countInStock: 20,
    imageUrl: "https://example.com/images/headphones1.jpg",
    category: "Electronics",
    isFeatured: true,
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Durable and dishwasher-safe water bottle.",
    price: 15.49,
    countInStock: 35,
    imageUrl: "https://example.com/images/bottle1.jpg",
    category: "Accessories",
    isFeatured: false,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected for seeding products!");

    // Clear existing products
    await Product.deleteMany();
    console.log("Deleted existing products.");

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log("Sample products inserted!");

    process.exit();
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
