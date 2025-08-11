// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchCart,
  clearCartError,
  resetCart,
  removeFromCart,
  clearCartOnServer,
} from "../features/cart/cartSlice";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

const MAX_ADDRESSES = 10;

const CheckoutForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  // State for addresses management
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load PayPal script reducer for SDK loading state
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // Pricing calculations
  const itemsPrice = cartItems.reduce(
    (acc, it) => acc + (it.product?.price || 0) * it.quantity,
    0
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 15;
  const taxPrice = Number((0.1 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  // Load addresses & cart on mount
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    dispatch(fetchCart());

    axios
      .get("http://localhost:5000/api/user/shipping-addresses")
      .then((res) => {
        const addrs = Array.isArray(res.data) ? res.data : [];
        setAddresses(addrs);
        if (addrs.length) setSelectedId(addrs[0]._id);
      })
      .catch(() => setAddresses([]));

    // Reset PayPal script options on payment method change
  }, [userInfo, navigate, dispatch]);

  // Load PayPal SDK when payment method changes to PayPal
  useEffect(() => {
    if (paymentMethod === "paypal") {
      paypalDispatch({
        type: "resetOptions",
        value: {
          "client-id":
            "ASQvvblQO17Bw-9oWcCogIA2zjSacuhGG9TAT3fIIBpOVARgxBoHB5rFDskLXvuZQgNb7g1WSa6Z3muP",
          currency: "USD",
        },
      });
      paypalDispatch({ type: "setLoadingStatus", value: "pending" });
    }
  }, [paymentMethod, paypalDispatch]);

  // Address form input change
  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Add new address handler
  const handleAddAddress = () => {
    if (addresses.length >= MAX_ADDRESSES) {
      toast.error(`You can store a maximum of ${MAX_ADDRESSES} addresses.`);
      return;
    }
    setShowForm(true);
  };

  // Save new address via backend API
  const saveNewAddress = () => {
    const errors = {};
    Object.entries(form).forEach(([key, val]) => {
      if (!val.trim()) errors[key] = "Required";
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    axios
      .post("http://localhost:5000/api/user/shipping-addresses", form)
      .then((res) => {
        toast.success("Address added");
        setAddresses(res.data);
        setShowForm(false);
        setForm({
          fullName: "",
          address: "",
          city: "",
          postalCode: "",
          country: "",
          phone: "",
        });
        if (!selectedId && res.data.length) setSelectedId(res.data[0]._id);
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to add address")
      );
  };

  // Remove address
  const deleteAddress = (id) => {
    axios
      .delete(`http://localhost:5000/api/user/shipping-addresses/${id}`)
      .then((res) => {
        toast.success("Address removed");
        setAddresses(res.data);
        if (selectedId === id && res.data.length > 0)
          setSelectedId(res.data[0]._id);
        else if (res.data.length === 0) setSelectedId(null);
      })
      .catch(() => toast.error("Failed to delete address"));
  };

  // Validate form fields before order submission
  const validateForm = () => {
    if (!selectedId) {
      toast.error("Please select a shipping address.");
      return false;
    }
    return true;
  };

  // Create PayPal order on backend
  const createPaypalOrder = async () => {
    const response = await axios.post(
      "http://localhost:5000/api/orders/create-paypal-order",
      {
        totalPrice,
      }
    );
    return response.data.orderID;
  };

  // Capture PayPal order on backend and place order in DB
  const onApprovePaypal = async (data) => {
    setSubmitting(true);

    try {
      const captureRes = await axios.post(
        `http://localhost:5000/orders/capture-paypal-order/${data.orderID}`
      );

      const paymentResult = {
        id: captureRes.data.id,
        status: captureRes.data.status,
        update_time: captureRes.data.update_time,
        email_address: captureRes.data.payer.email_address || "",
      };

      await placeOrder(paymentResult);
    } catch (error) {
      toast.error("PayPal payment capture failed.");
      setSubmitting(false);
    }
  };

  // Place order in DB (with optional PayPal paymentResult)
  const placeOrder = async (paymentResult = null) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      setSubmitting(false);
      return;
    }
    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      const addr = addresses.find((addr) => addr._id === selectedId);
      const orderData = {
        orderItems: cartItems.map(({ product, quantity }) => ({
          product: product._id,
          quantity,
        })),
        shippingAddress: {
          address: addr.address,
          city: addr.city,
          postalCode: addr.postalCode,
          country: addr.country,
        },
        paymentMethod:
          paymentMethod === "paypal"
            ? "PayPal"
            : paymentMethod === "credit_card"
            ? "Credit Card"
            : "COD",
        paymentResult,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const res = await axios.post(
        "http://localhost:5000/api/orders",
        orderData
      );

      if (res.status === 201) {
        toast.success("Order placed successfully!");
        dispatch(clearCartOnServer());
        navigate("/"); // Redirect to home or order confirmation
      }
    } catch (error) {
      toast.error("Order placement failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle submit for non-PayPal methods
  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod !== "paypal") {
      placeOrder();
    }
  };

  const showPaypalButtons = paymentMethod === "paypal";

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center">
        Checkout
      </h1>
      <div className="flex flex-col md:flex-row md:space-x-12">
        {/* Shipping and Payment Form */}
        <section className="flex-1 bg-white p-8 rounded-lg shadow-lg mb-8 md:mb-0">
          <h2 className="text-2xl font-semibold mb-6">Shipping Addresses</h2>
          {addresses.length > 0 ? (
            <div className="space-y-4 mb-4 max-h-96 overflow-auto">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="flex items-start justify-between p-3 border rounded"
                >
                  <label className="flex gap-3 cursor-pointer w-full">
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedId === addr._id}
                      onChange={() => setSelectedId(addr._id)}
                      className="mt-1 accent-indigo-600"
                    />
                    <div>
                      <div className="font-medium">{addr.fullName}</div>
                      <div className="text-sm text-gray-600">
                        {addr.address}, {addr.city}, {addr.postalCode},{" "}
                        {addr.country}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phone: {addr.phone}
                      </div>
                    </div>
                  </label>
                  <button
                    onClick={() => deleteAddress(addr._id)}
                    className="text-red-600 hover:text-red-800 ml-4 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-gray-500">No saved addresses yet.</p>
          )}

          {!showForm && addresses.length < MAX_ADDRESSES && (
            <button
              onClick={handleAddAddress}
              className="mb-6 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer"
            >
              + Add New Address
            </button>
          )}

          {/* New Address Form */}
          {showForm && (
            <div className="mb-6 space-y-3 border p-4 rounded bg-gray-50">
              {[
                "fullName",
                "address",
                "city",
                "postalCode",
                "country",
                "phone",
              ].map((field) => (
                <div key={field}>
                  <label
                    htmlFor={`form-${field}`}
                    className="block text-sm font-semibold mb-1 capitalize"
                  >
                    {field}
                  </label>
                  <input
                    id={`form-${field}`}
                    name={field}
                    placeholder={`Enter ${field}`}
                    value={form[field]}
                    onChange={handleFormChange}
                    className={`w-full rounded border px-3 py-2 ${
                      formErrors[field] ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                  />
                  {formErrors[field] && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors[field]}
                    </p>
                  )}
                </div>
              ))}
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={saveNewAddress}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormErrors({});
                    setForm({
                      fullName: "",
                      address: "",
                      city: "",
                      postalCode: "",
                      country: "",
                      phone: "",
                    });
                  }}
                  className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="flex gap-3 cursor-pointer items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={paymentMethod === "credit_card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-indigo-600"
                />
                Credit Card
              </label>
              <label className="flex gap-3 cursor-pointer items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-indigo-600"
                />
                PayPal
              </label>
              <label className="flex gap-3 cursor-pointer items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-indigo-600"
                />
                Cash on Delivery
              </label>
            </div>

            {/* PayPal Buttons */}
            {showPaypalButtons && (
              <div className="mt-6">
                {isPending ? (
                  <div>Loading PayPal...</div>
                ) : (
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={createPaypalOrder}
                    onApprove={onApprovePaypal}
                    onError={(err) => {
                      toast.error("PayPal payment failed.");
                    }}
                  />
                )}
              </div>
            )}

            {/* Place Order Button for other methods */}
            {!showPaypalButtons && (
              <button
                type="submit"
                disabled={submitting || !selectedId || cartItems.length === 0}
                className={`mt-6 w-full rounded bg-indigo-600 px-6 py-3 text-white font-semibold text-lg cursor-pointer transition-colors ${
                  submitting || !selectedId || cartItems.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }`}
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>
            )}
          </form>
        </section>

        {/* Summary Section */}
        <aside className="bg-white p-8 rounded-lg shadow-lg w-full md:w-96 md:sticky md:top-10 h-fit">
          <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200 max-h-96 overflow-auto mb-6">
                {cartItems.map(({ product, quantity }) => (
                  <li
                    key={product?._id || Math.random()}
                    className="flex justify-between items-center py-3"
                  >
                    <div className="flex items-center gap-3">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {product?.name || "Product"}
                        </p>
                        <p className="text-sm text-gray-600">Qty: {quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      ₹{(product?.price * quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between font-semibold">
                  <span>Items:</span>
                  <span>₹{itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>
                    {shippingPrice === 0
                      ? "Free"
                      : `$${shippingPrice.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>₹{taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                  <span>Total:</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "ASQvvblQO17Bw-9oWcCogIA2zjSacuhGG9TAT3fIIBpOVARgxBoHB5rFDskLXvuZQgNb7g1WSa6Z3muP",
        currency: "USD",
      }}
    >
      <CheckoutForm />
    </PayPalScriptProvider>
  );
};

export default Checkout;
