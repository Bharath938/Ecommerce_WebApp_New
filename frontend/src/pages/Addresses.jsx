// src/pages/Addresses.jsx
import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Addresses = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    setLoading(true);
    axios
      .get(
        "https://ecommerce-web-app-new.vercel.app/api/user/shipping-addresses"
      )
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAddresses(res.data);
        } else {
          setAddresses([]);
        }
      })
      .catch(() => toast.error("Failed to fetch addresses"))
      .finally(() => setLoading(false));
  }, [userInfo, navigate]);

  const handleToggle = (id) => {
    setSelected(selected === id ? null : id);
  };

  return (
    <div>
      {loading ? (
        <div className="text-center text-indigo-600">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center text-gray-500">No saved addresses.</div>
      ) : (
        <div className="space-y-6">
          {addresses.map((addr) => (
            <div
              key={addr._id || addr.address} // fallback if _id missing
              className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <div className="font-bold text-lg text-indigo-700">
                    {addr.fullName}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {addr.address}, {addr.city}
                  </div>
                  <div className="text-xs text-gray-400">
                    {addr.country} - {addr.postalCode}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleToggle(addr._id)}
                    className="text-indigo-600 cursor-pointer font-semibold hover:underline text-sm"
                  >
                    {selected === addr._id ? "Hide Details" : "View Details"}
                  </button>
                </div>
              </div>
              {selected === addr._id && (
                <div className="mt-6">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Full Name:</span>{" "}
                      {addr.fullName}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Address:</span>{" "}
                      {addr.address}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">City:</span> {addr.city}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Postal Code:</span>{" "}
                      {addr.postalCode}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Country:</span>{" "}
                      {addr.country}
                    </div>
                    {addr.phone && (
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Phone:</span>{" "}
                        {addr.phone}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
