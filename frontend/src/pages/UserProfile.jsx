import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUserProfile,
  updateUserProfile,
  resetProfileState,
} from "../features/user/userProfileSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Orders from "./OrderPage";
import Addresses from "./Addresses";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { user, loading, error, success } = useSelector(
    (state) => state.userProfile
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    if (!user) {
      dispatch(fetchUserProfile());
    } else {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [userInfo, user, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    dispatch(
      updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        password: password ? password : undefined,
      })
    ).then(() => {
      setPassword("");
      setConfirmPassword("");
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {name ? name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {name}
                    </h3>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                {[
                  { id: "profile", name: "Profile Information", icon: "👤" },
                  { id: "orders", name: "My Orders", icon: "📦" },
                  { id: "addresses", name: "Addresses", icon: "📍" },
                  { id: "payments", name: "Payment Methods", icon: "💳" },
                  { id: "preferences", name: "Preferences", icon: "⚙️" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex cursor-pointer items-center px-4 py-3 text-left rounded-md transition-colors duration-200 ${
                      activeTab === item.id
                        ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Stats Card */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Account Summary
              </h4>
              <div className="space-y-4">
                {[
                  {
                    label: "Total Orders",
                    value: "23",
                    color: "text-blue-600",
                  },
                  {
                    label: "Total Spent",
                    value: "₹45,230",
                    color: "text-green-600",
                  },
                  {
                    label: "Saved Addresses",
                    value: "3",
                    color: "text-purple-600",
                  },
                  {
                    label: "Loyalty Points",
                    value: "1,240",
                    color: "text-orange-600",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span className={`font-semibold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Information
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors cursor-pointer duration-200 ${
                      isEditing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                <div className="p-6">
                  {error && (
                    <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50">
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
                        <p className="text-red-800 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 p-4 border border-green-200 rounded-md bg-green-50">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <p className="text-green-800 font-medium">
                          Profile updated successfully!
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 ${
                            !isEditing
                              ? "bg-gray-50 cursor-not-allowed"
                              : "bg-white"
                          }`}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 ${
                            !isEditing
                              ? "bg-gray-50 cursor-not-allowed"
                              : "bg-white"
                          }`}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password{" "}
                            <span className="text-gray-500 font-normal">
                              (optional)
                            </span>
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    )}

                    {isEditing && (
                      <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Orders
                  </h2>
                </div>
                <div className="p-6">
                  {/* Render your Orders component */}
                  <Orders />

                  {/* If you want pagination here — assuming Orders accepts page props */}
                  {/* Example:
      <Orders pageSize={5} /> 
      */}
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Saved Addresses
                  </h2>
                </div>
                <div className="p-6">
                  <Addresses />
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment Methods
                  </h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No payment methods
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add payment methods for secure checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Preferences
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Email Notifications
                        </h4>
                        <p className="text-sm text-gray-500">
                          Receive order updates via email
                        </p>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        role="switch"
                        aria-checked="true"
                      >
                        <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          SMS Notifications
                        </h4>
                        <p className="text-sm text-gray-500">
                          Receive order updates via SMS
                        </p>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        role="switch"
                        aria-checked="false"
                      >
                        <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
