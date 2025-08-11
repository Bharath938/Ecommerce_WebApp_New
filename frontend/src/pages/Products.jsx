// src/pages/Products.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../utils/axiosConfig";
import { addToCart, fetchCart } from "../features/cart/cartSlice";
import { toast } from "react-toastify";

const CATEGORY_DISPLAY_NAMES = {
  mobiles: "Mobiles and Tablets",
  fashion: "Fashion",
  electronics: "Electronics",
  home: "Home and Furniture",
  appliances: "TVs and Appliances",
  beauty: "Beauty & Food",
  grocery: "Grocery",
  sports: "Sports & Fitness",
};

const Products = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category");

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products once
  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        if (Array.isArray(res.data)) setAllProducts(res.data);
        else setAllProducts([]);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to fetch products");
        setAllProducts([]);
      })
      .finally(() => setLoading(false));
    dispatch(fetchCart());
  }, [dispatch]);

  // Client-side filter by category (case-insensitive, trim any whitespace)
  const filteredProducts = category
    ? allProducts.filter(
        (p) =>
          p.category &&
          p.category.toLowerCase().trim() === category.toLowerCase().trim()
      )
    : allProducts;

  const handleAddToCart = (productId) => {
    if (!userInfo) {
      toast.info("Please login to add items to cart.");
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success("Added to cart");
        dispatch(fetchCart());
      })
      .catch(() => toast.error("Failed to add to cart"));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {category
              ? CATEGORY_DISPLAY_NAMES[category] || "Products"
              : "All Products"}
          </h1>
          {category && (
            <Link
              to="/products"
              className="text-indigo-600 underline hover:no-underline mt-3 md:mt-0"
            >
              View All Categories
            </Link>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-16 font-semibold">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
              >
                <Link to={`/product/${product._id}`}>
                  <div className="relative h-52 bg-gray-100 flex items-center justify-center">
                    {Array.isArray(product.images) && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-gray-400">No Image</div>
                    )}
                    {/* LOW STOCK BADGE */}
                    {product.countInStock <= 10 && product.countInStock > 0 && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                        Only {product.countInStock} left
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-grow">
                  <Link
                    to={`/product/${product._id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <div className="text-indigo-600 font-bold text-lg mt-2">
                    ₹{product.price.toFixed(2)}
                  </div>
                  <button
                    disabled={product.countInStock === 0}
                    onClick={() => handleAddToCart(product._id)}
                    className={`mt-auto py-2 rounded-md text-white font-medium transition-colors cursor-pointer ${
                      product.countInStock === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {product.countInStock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
