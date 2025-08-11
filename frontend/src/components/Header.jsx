import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { fetchCart, resetCart } from "../features/cart/cartSlice";
import axios from "../utils/axiosConfig";
import { toast } from "react-toastify";
import { resetProfileState } from "../features/user/userProfileSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const searchInputRef = useRef(null);

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifDropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Fetch notifications for logged-in user
  useEffect(() => {
    if (!userInfo) {
      setNotifications([]);
      return;
    }
    const fetchNotifs = async () => {
      try {
        setNotifLoading(true);
        const { data } = await axios.get(
          "https://ecommerce-web-app-new.vercel.app/api/notifications"
        );
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Notif fetch failed");
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [userInfo]);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!profileOpen && !notifOpen) return;
    function handleClickOutside(e) {
      if (profileOpen && !e.target.closest("#profileMenu")) {
        setProfileOpen(false);
      }
      if (
        notifOpen &&
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen, notifOpen]);

  // Search logic
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setIsLoadingSearch(true);
        const { data } = await axios.get(
          `https://ecommerce-web-app-new.vercel.app/api/products?search=${encodeURIComponent(
            searchTerm
          )}`
        );
        setSearchResults(Array.isArray(data) ? data : []);
        setSearchOpen(true);
      } catch (err) {
        toast.error("Search failed");
      } finally {
        setIsLoadingSearch(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setHighlightIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!searchOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < searchResults.length) {
        handleSuggestionClick(searchResults[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm("");
    setSearchOpen(false);
    navigate(`/product/${product._id}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    dispatch(resetProfileState());
    setProfileOpen(false);
    navigate("/login");
  };

  const handleNotificationClick = async (notif) => {
    setNotifOpen(false);
    if (!notif.isRead) {
      try {
        await axios.patch(
          `https://ecommerce-web-app-new.vercel.app/api/notifications/${notif._id}/read`
        );
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch {}
    }
    navigate(`/orders`);
  };

  return (
    <header className="sticky top-0 bg-indigo-700 text-white shadow-md z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold hover:text-indigo-300">
          QuickBasket
        </Link>

        {/* Search */}
        <div className="relative w-64 md:w-96 hidden md:block">
          <input
            type="text"
            ref={searchInputRef}
            placeholder="Search products..."
            className="w-full rounded-md px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
            autoComplete="off"
          />
          {searchOpen && (
            <ul className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto bg-white shadow-lg rounded-md text-gray-900 z-50">
              {isLoadingSearch && (
                <li className="px-4 py-2 text-gray-500">Loading...</li>
              )}
              {!isLoadingSearch && searchResults.length === 0 && (
                <li className="px-4 py-2 text-gray-500">No products found</li>
              )}
              {!isLoadingSearch &&
                searchResults.map((product, idx) => (
                  <li
                    key={product._id}
                    onClick={() => handleSuggestionClick(product)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${
                      highlightIndex === idx
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-indigo-100"
                    }`}
                  >
                    <img
                      src={
                        product.images?.[0] || "https://via.placeholder.com/40"
                      }
                      alt={product.name}
                      className="w-8 h-8 object-cover rounded"
                      loading="lazy"
                    />
                    <span className="truncate">{product.name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-300 font-semibold"
                : "hover:text-indigo-300"
            }
          >
            Home
          </NavLink>
          <NavLink to="/products" className="hover:text-indigo-300">
            Products
          </NavLink>
          {userInfo?.user.isAdmin && (
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-300 font-semibold"
                  : "hover:text-indigo-300"
              }
            >
              Admin
            </NavLink>
          )}
          {userInfo && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-300 font-semibold"
                  : "hover:text-indigo-300"
              }
            >
              My Orders
            </NavLink>
          )}

          {/* Notification Bell */}
          {userInfo && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative focus:outline-none hover:text-indigo-300 cursor-pointer"
                aria-label="Notifications"
              >
                <span
                  style={{ fontSize: 20 }}
                  role="img"
                  aria-label="Notifications"
                >
                  🔔
                </span>
                {notifications.some((n) => !n.isRead) && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white rounded-full px-1.5 py-0.5 font-bold">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white text-gray-900 rounded shadow-lg z-50 border">
                  <div className="px-4 py-2 border-b font-bold text-lg">
                    Notifications
                  </div>
                  <div className="divide-y">
                    {notifLoading && (
                      <div className="p-4 text-gray-500 text-center">
                        Loading...
                      </div>
                    )}
                    {!notifLoading && notifications.length === 0 && (
                      <div className="p-4 text-gray-500 text-center">
                        No notifications
                      </div>
                    )}
                    {!notifLoading &&
                      notifications.map((notif) => (
                        <button
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full text-left px-4 py-3 transition flex items-start ${
                            notif.isRead
                              ? "bg-gray-50 text-gray-500"
                              : "bg-indigo-50 font-semibold text-gray-900"
                          } hover:bg-indigo-100`}
                          style={{ wordBreak: "break-word" }}
                        >
                          <div className="flex-1 min-w-0">
                            <div>{notif.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-300 font-semibold relative flex items-center"
                : "hover:text-indigo-300 relative flex items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7H17m-6 0a1 1 0 11-2 0m4 0a1 1 0 11-2 0"
              />
            </svg>
            Cart
            {totalQuantity > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                {totalQuantity}
              </span>
            )}
          </NavLink>

          {/* Profile */}
          <div className="relative" id="profileMenu">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center space-x-2 focus:outline-none hover:text-indigo-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A7.968 7.968 0 0112 15a7.968 7.968 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{userInfo?.user.name || "Account"}</span>
              <svg
                className={`h-5 w-5 transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50">
                {!userInfo ? (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 hover:bg-indigo-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 hover:bg-indigo-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-indigo-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-indigo-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
