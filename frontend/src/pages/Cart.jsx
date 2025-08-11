// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  fetchCart,
  addToCart,
  clearCartError,
  updateCartItem,
} from "../features/cart/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, loading, error } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [editingQuantity, setEditingQuantity] = useState({});

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    dispatch(fetchCart());

    return () => {
      dispatch(clearCartError());
    };
  }, [dispatch, userInfo, navigate]);

  const handleQuantityChange = (productId, quantity) => {
    const item = cartItems.find((item) => item.product._id === productId);
    if (quantity < 1 || quantity > item?.product.countInStock) {
      toast.error(
        `Quantity must be between 1 and ${item?.product.countInStock}`
      );
      return;
    }

    dispatch(updateCartItem({ productId, quantity }))
      .unwrap()
      .then(() => {
        toast.success("Cart updated");
        dispatch(fetchCart());
      })
      .catch((err) => toast.error(err || "Failed to update cart"));
  };

  const handleQuantityEdit = (productId, value) => {
    setEditingQuantity((prev) => ({ ...prev, [productId]: value }));
  };

  const handleQuantityBlur = (productId) => {
    const newQty = parseInt(editingQuantity[productId]);
    if (!isNaN(newQty) && newQty > 0) {
      handleQuantityChange(productId, newQty);
    }
    setEditingQuantity((prev) => ({ ...prev, [productId]: undefined }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId))
      .unwrap()
      .then(() => {
        toast.success("Item removed from cart");
        dispatch(fetchCart());
      })
      .catch((err) => toast.error(err || "Failed to remove item"));
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">
            {cartItems.length > 0
              ? `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`
              : "Your cart is empty"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* icon */}
            </svg>
            <h3 className="text-2xl font-medium text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 mb-8">
              Start shopping to add items to your cart
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Cart Items
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={
                              Array.isArray(product.images) && product.images[0]
                                ? product.images[0]
                                : "https://via.placeholder.com/120"
                            }
                            alt={product.name}
                            className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${product._id}`}
                            className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-200"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            In stock: {product.countInStock} units
                          </p>

                          {/* ✅ Low stock warning */}
                          {product.countInStock <= 10 &&
                            product.countInStock > 0 && (
                              <p className="mt-1 text-xs font-bold text-red-600">
                                Only {product.countInStock} left in stock!
                              </p>
                            )}

                          <div className="mt-2 flex items-center">
                            <span className="text-xl font-bold text-indigo-600">
                              ₹{product.price.toFixed(2)}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              each
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  product._id,
                                  Math.max(1, quantity - 1)
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-l-lg transition-colors duration-200 cursor-pointer"
                              disabled={quantity <= 1}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={product.countInStock}
                              value={
                                editingQuantity[product._id] !== undefined
                                  ? editingQuantity[product._id]
                                  : quantity
                              }
                              onChange={(e) =>
                                handleQuantityEdit(product._id, e.target.value)
                              }
                              onBlur={() => handleQuantityBlur(product._id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleQuantityBlur(product._id);
                                }
                              }}
                              className="w-16 text-center border-0 focus:ring-0 focus:outline-none"
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  product._id,
                                  Math.min(product.countInStock, quantity + 1)
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-r-lg transition-colors duration-200 cursor-pointer"
                              disabled={quantity >= product.countInStock}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ₹{(product.price * quantity).toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleRemove(product._id)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-200 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Order Summary
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="font-medium">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping estimate</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax estimate</span>
                    <span className="font-medium">
                      ₹{(totalPrice * 0.18).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">
                        Order total
                      </span>
                      <span className="text-xl font-bold text-indigo-600">
                        ₹{(totalPrice * 1.18).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                  <Link
                    to="/"
                    className="mt-3 w-full bg-white border border-gray-300 rounded-md shadow-sm py-3 px-4 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
