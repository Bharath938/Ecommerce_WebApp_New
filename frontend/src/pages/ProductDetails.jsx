// src/pages/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, fetchCart } from "../features/cart/cartSlice";
import { toast } from "react-toastify";
import axios from "../utils/axiosConfig";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(
          `https://ecommerce-web-app-new.vercel.app/api/products/${id}`
        );
        setProductDetails(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!userInfo) {
      toast.info("Please login to add items to cart.");
      navigate("/login");
      return;
    }
    dispatch(addToCart({ productId: id, quantity }))
      .unwrap()
      .then(() => {
        toast.success("Added to cart");
        dispatch(fetchCart());
      })
      .catch((err) => {
        toast.error(err || "Failed to add to cart");
      });
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-indigo-600 font-semibold animate-pulse">
        Loading product details...
      </p>
    );
  if (error)
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        Error loading product: {error}
      </p>
    );
  if (!productDetails) return null;

  const productImages =
    Array.isArray(productDetails.images) && productDetails.images.length > 0
      ? productDetails.images
      : ["https://via.placeholder.com/500x500"];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        to={`/products/${id}`}
        className="text-indigo-600 hover:underline font-medium inline-block mb-6"
      >
        &larr; Back to Products
      </Link>

      <div className="flex flex-col lg:flex-row gap-10 bg-white rounded-xl shadow-lg p-6">
        {/* Image Section */}
        <div className="flex-1">
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm aspect-[4/3]">
            <img
              alt={productDetails.name}
              src={productImages[0]}
              className="w-full h-full object-contain object-center transition-transform duration-300 hover:scale-105"
            />
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-3 mt-4">
              {productImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${productDetails.name}-${idx}`}
                  className="w-20 h-20 object-cover rounded border border-gray-200 cursor-pointer hover:border-indigo-500"
                  onClick={() => {
                    const imgs = [...productImages];
                    imgs[0] = img;
                    setProductDetails({ ...productDetails, images: imgs });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {productDetails.name}
          </h1>

          {/* Category & Rating */}
          <div className="flex items-center gap-4 mb-3 text-gray-500">
            <span className="capitalize bg-gray-100 px-3 py-1 rounded-full text-sm">
              {productDetails.category || "General"}
            </span>
            {productDetails.rating > 0 && (
              <span className="flex items-center text-yellow-500">
                {"★".repeat(Math.round(productDetails.rating))}
                {"☆".repeat(5 - Math.round(productDetails.rating))}
              </span>
            )}
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {productDetails.description}
          </p>

          <p className="text-3xl font-extrabold text-indigo-700 mb-4">
            ₹{productDetails.price.toFixed(2)}
          </p>

          {/* Stock Status */}
          <p
            className={`mb-1 font-semibold text-lg ${
              productDetails.countInStock > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {productDetails.countInStock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          {/* ✅ Low stock warning */}
          {productDetails.countInStock <= 10 &&
            productDetails.countInStock > 0 && (
              <p className="mb-6 text-sm font-bold text-red-600">
                Only {productDetails.countInStock} left in stock!
              </p>
            )}

          {/* Quantity Selector */}
          {productDetails.countInStock > 0 && (
            <div className="mb-6">
              <label className="mr-3 font-medium text-gray-700">
                Quantity:
              </label>
              <select
                className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[...Array(productDetails.countInStock).keys()].map((x) => (
                  <option key={x + 1} value={x + 1}>
                    {x + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            disabled={productDetails.countInStock === 0}
            onClick={handleAddToCart}
            className={`w-full md:w-auto bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 transition-all cursor-pointer ${
              productDetails.countInStock === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-[1.02]"
            }`}
          >
            {productDetails.countInStock === 0 ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
