// src/pages/AdminOrders.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminOrders,
  updateOrderStatus,
} from "../features/admin/adminOrdersSlice";
import { toast } from "react-toastify";

const statusOptions = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }))
      .unwrap()
      .then(() => toast.success("Order status updated"))
      .catch((err) => toast.error(err));
  };

  return (
    <div className="container mx-auto p-4 w-full">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        Admin – Manage Orders
      </h1>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
              <th className="p-3 border text-center">Order ID</th>
              <th className="p-3 border text-center">Customer</th>
              <th className="p-3 border text-center">Date</th>
              <th className="p-3 border text-center">Total</th>
              <th className="p-3 border text-center">Status</th>
              <th className="p-3 border text-center">Change Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr
                key={o._id}
                className={`border-t hover:bg-gray-50 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="p-3 border text-center align-middle font-mono">
                  {o._id.slice(-6).toUpperCase()}
                </td>
                <td className="p-3 border text-center align-middle">
                  {o.user?.name || "—"}
                </td>
                <td className="p-3 border text-center align-middle">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="p-3 border text-center align-middle font-semibold text-indigo-700">
                  ₹{o.totalPrice.toFixed(2)}
                </td>
                <td className="p-3 border text-center align-middle">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      o.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : o.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : o.status === "Shipped"
                        ? "bg-blue-100 text-blue-700"
                        : o.status === "Processing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {o.status || "Pending"}
                  </span>
                </td>
                <td className="p-3 border text-center align-middle">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {statusOptions.map((stat) => (
                      <option key={stat} value={stat}>
                        {stat}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-500 py-6 border"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
