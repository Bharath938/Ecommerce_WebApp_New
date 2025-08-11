import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const Orders = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const location = useLocation();
  const currentPath = location.pathname;
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // Orders per page

  // Pagination logic
  const totalPages = Math.ceil(orders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    setLoading(true);
    axios
      .get("http://localhost:5000/api/orders/myorders")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      })
      .catch(() => toast.error("Failed to fetch orders"))
      .finally(() => setLoading(false));
  }, [userInfo, navigate]);

  // Mark notification as read when expanded
  useEffect(() => {
    if (!userInfo || !selected) return;

    // Fetch notifications for the logged-in user
    axios.get("http://localhost:5000/api/notifications").then((res) => {
      const arr = Array.isArray(res.data) ? res.data : [];
      arr.forEach((notif) => {
        if (!notif.isRead) {
          axios.patch(
            `http://localhost:5000/api/notifications/${notif._id}/read`
          );
        }
      });
    });
  }, [selected, userInfo]);

  const handleShowDetails = (orderId) => {
    setSelected(selected === orderId ? null : orderId);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {currentPath === "/orders" && (
        <h1 className="text-4xl font-extrabold mb-10 text-gray-900 text-center">
          My Orders
        </h1>
      )}
      {loading ? (
        <div className="text-center text-indigo-600">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders found.</div>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow p-6 border border-gray-100 transition-all hover:shadow-lg"
              >
                {/* Summary */}
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-lg text-indigo-700">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Placed:{" "}
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </div>
                    <div className="mt-1 flex gap-2 items-center text-sm">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status ||
                          (order.isDelivered
                            ? "Delivered"
                            : "Pending Delivery")}
                      </span>
                      {order.isPaid && (
                        <span className="px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
                          Paid
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-end gap-2 mt-4 md:mt-0">
                    <div className="text-xl font-bold text-indigo-700">
                      ₹{order.totalPrice.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleShowDetails(order._id)}
                      className="text-indigo-600 cursor-pointer font-semibold hover:underline text-sm"
                    >
                      {selected === order._id ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selected === order._id && (
                  <div className="mt-6">
                    {/* Products */}
                    <div>
                      <div className="font-semibold mb-2 underline">
                        Products
                      </div>
                      <div className="divide-y">
                        {order.orderItems.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center gap-4 py-3"
                          >
                            <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-50 flex items-center justify-center">
                              {item.product?.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  No Image
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold">
                                {item.product?.name || "Product"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.quantity} x ₹
                                {item.product?.price?.toFixed(2) || "--"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping address */}
                    <div className="mt-6">
                      <div className="font-semibold mb-1 underline">
                        Shipping Address
                      </div>
                      <div className="text-gray-700 text-sm">
                        {order.shippingAddress.address},{" "}
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.postalCode},{" "}
                        {order.shippingAddress.country}
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="mt-6">
                      <div className="font-semibold mb-1 underline">
                        Payment Info
                      </div>
                      <div className="text-gray-700 text-sm">
                        Method: {order.paymentMethod}
                      </div>
                      {order.paymentResult?.id && (
                        <div className="text-gray-500 text-xs mt-1">
                          Transaction: {order.paymentResult.id}
                        </div>
                      )}
                    </div>

                    {/* Price breakdown */}
                    <div className="mt-6">
                      <div className="font-semibold mb-1 underline">
                        Order Breakdown
                      </div>
                      <div className="text-sm text-gray-700">
                        <div>Items: ₹{order.itemsPrice.toFixed(2)}</div>
                        <div>Shipping: ₹{order.shippingPrice.toFixed(2)}</div>
                        <div>Tax: ₹{order.taxPrice.toFixed(2)}</div>
                        <div className="font-bold text-lg mt-2">
                          Total: ₹{order.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Delivery info */}
                    {order.status === "Delivered" && order.deliveredAt && (
                      <div className="mt-6 text-sm text-gray-500">
                        Delivered at:{" "}
                        {new Date(order.deliveredAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white font-semibold"
                      : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
