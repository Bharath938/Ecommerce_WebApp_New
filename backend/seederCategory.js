const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/Category");

dotenv.config();

const categories = [
  {
    key: "mobiles",
    name: "Mobiles and Tablets",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREbPihC2YU7VhqVJpM0ZCzwroUHoDEAZfojg&s",
  },
  {
    key: "fashion",
    name: "Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1520975918319-cc69fc1a3e95?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "electronics",
    name: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1583225192042-6da86e64c3b5?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "home",
    name: "Home and Furniture",
    imageUrl:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "appliances",
    name: "TVs & Appliances",
    imageUrl:
      "https://images.unsplash.com/photo-1616627720170-11acfa876d5f?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "beauty",
    name: "Beauty & Food",
    imageUrl:
      "https://images.unsplash.com/photo-1500839941678-aae14dbfae1b?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "grocery",
    name: "Grocery",
    imageUrl:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "sports",
    name: "Sports & Fitness",
    imageUrl:
      "https://fastly.picsum.photos/id/1024/600/400.jpg?hmac=DVtU0UWOlOxLxLy8xDog1kVSZGvUpilfW3KuXkH82hc",
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log("✅ Categories seeded");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error seeding categories:", err);
    process.exit(1);
  });
