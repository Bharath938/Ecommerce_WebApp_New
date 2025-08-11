// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosConfig";

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          "https://ecommerce-web-app-new.vercel.app/api/categories"
        );
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (name) => {
    navigate(`/products?category=${name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative w-full h-72 md:h-96 bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-lg">
        <div className="text-center px-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-md mb-4">
            Welcome to QuickBasket
          </h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-md">
            Discover your favorite products across top categories with amazing
            deals.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
          Shop by Category
        </h2>
        {categories.length === 0 ? (
          <p className="text-center text-gray-500">No categories found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition will-change-transform transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 cursor-pointer"
              >
                <div className="w-full h-40 overflow-hidden rounded-3xl relative">
                  <img
                    src={cat.imageUrl || cat.imgSrc}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition duration-300 rounded-3xl pointer-events-none" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white font-bold text-lg text-center drop-shadow-lg pointer-events-none">
                  {cat.name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center px-6">
          <div>
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-4xl shadow-lg">
              ✅
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              Quality Guaranteed
            </h3>
            <p className="text-gray-600 text-base">
              All products go through stringent quality checks for your peace of
              mind.
            </p>
          </div>
          <div>
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-4xl shadow-lg">
              🚚
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              Fast & Free Delivery
            </h3>
            <p className="text-gray-600 text-base">
              Free delivery on orders above ₹499 with reliable and fast
              shipping.
            </p>
          </div>
          <div>
            <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-4xl shadow-lg">
              🔒
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              Secure Payments
            </h3>
            <p className="text-gray-600 text-base">
              Safe, encrypted payment process with multiple payment options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
