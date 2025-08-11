// src/AppRouter.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AdminProductsList from "./pages/AdminProductList";
import Checkout from "./pages/Checkout";
import Orders from "./pages/OrderPage";
import AdminOrders from "./pages/AdminOrders";
import UserProfile from "./pages/UserProfile";
import Products from "./pages/Products";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/product/:id" element={<ProductDetails />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/admin/products" element={<AdminProductsList />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/admin/orders" element={<AdminOrders />} />
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/products" element={<Products />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    {/* Add other routes as needed */}
  </Routes>
);

export default AppRouter;
