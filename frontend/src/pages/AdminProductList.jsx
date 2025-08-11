// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  clearAdminProductsError,
} from "../features/admin/adminProductSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminOrders from "./AdminOrders"; // will use once you give the updated AdminOrders

// Modal Component for Create/Edit
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-xl w-full p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const initialForm = {
  name: "",
  price: "",
  description: "",
  countInStock: "",
  images: [""],
  category: "",
  isFeatured: false,
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector(
    (state) => state.adminProducts
  );
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Switch between tabs
  const [activeTab, setActiveTab] = useState("products");

  // Modal and Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // or 'edit'
  const [editProductId, setEditProductId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Guard admin route
  useEffect(() => {
    if (!userInfo || !userInfo.user?.isAdmin) {
      navigate("/");
    } else {
      dispatch(fetchAdminProducts());
    }
    return () => dispatch(clearAdminProductsError());
    // eslint-disable-next-line
  }, [dispatch, userInfo, navigate]);

  // Modal Handlers
  const openCreateModal = () => {
    setModalMode("create");
    setEditProductId(null);
    setFormData(initialForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setEditProductId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      countInStock: product.countInStock,
      images: Array.isArray(product.images) ? product.images : [product.images],
      category: product.category,
      isFeatured: product.isFeatured,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "images") {
      setFormData((prev) => ({
        ...prev,
        images: value
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Required";
    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) < 0
    )
      errors.price = "Valid price required";
    if (!formData.description.trim()) errors.description = "Required";
    if (
      formData.countInStock === "" ||
      isNaN(Number(formData.countInStock)) ||
      Number(formData.countInStock) < 0
    )
      errors.countInStock = "Valid stock required";
    if (!formData.category.trim()) errors.category = "Required";
    if (!formData.images || formData.images[0] === "")
      errors.images = "At least one image required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormSubmitting(true);
    try {
      if (modalMode === "create") {
        await dispatch(createProduct(formData)).unwrap();
        toast.success("Created 🎉");
      } else if (modalMode === "edit" && editProductId) {
        await dispatch(
          updateProduct({ id: editProductId, productData: formData })
        ).unwrap();
        toast.success("Updated 🎉");
      }
      setModalOpen(false);
      setEditProductId(null);
      dispatch(fetchAdminProducts());
    } catch (err) {
      toast.error(err || "Operation failed");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      dispatch(deleteProduct(id))
        .unwrap()
        .then(() => {
          toast.success("Deleted 🚮");
          dispatch(fetchAdminProducts());
        })
        .catch((err) => toast.error(err || "Delete failed"));
    }
  };

  const quickToggleFeatured = async (product) => {
    try {
      await dispatch(
        updateProduct({
          id: product._id,
          productData: { ...product, isFeatured: !product.isFeatured },
        })
      ).unwrap();
      toast.success(
        `Featured ${!product.isFeatured ? "enabled" : "disabled"} for '${
          product.name
        }'`
      );
      dispatch(fetchAdminProducts());
    } catch (err) {
      toast.error(err || "Toggle failed");
    }
  };

  // Table view for products
  const renderTable = () => (
    <div className="overflow-x-auto border rounded-lg shadow-lg bg-white">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 font-semibold">
          <tr>
            <th className="p-3 border-b">Image</th>
            <th className="p-3 border-b">Name</th>
            <th className="p-3 border-b">Price</th>
            <th className="p-3 border-b">Stock</th>
            <th className="p-3 border-b">Category</th>
            <th className="p-3 border-b">Featured</th>
            <th className="p-3 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="hover:bg-gray-50">
              <td className="p-3 border-b">
                {Array.isArray(p.images) && p.images[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                    No image
                  </div>
                )}
              </td>
              <td className="p-3 border-b">{p.name}</td>
              <td className="p-3 border-b">₹{Number(p.price).toFixed(2)}</td>
              <td className="p-3 border-b">{p.countInStock}</td>
              <td className="p-3 border-b">{p.category || "-"}</td>
              <td className="p-3 border-b">
                <button
                  onClick={() => quickToggleFeatured(p)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    p.isFeatured
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {p.isFeatured ? "Yes" : "No"}
                </button>
              </td>
              <td className="p-3 border-b text-right space-x-3">
                <button
                  onClick={() => openEditModal(p)}
                  className="text-indigo-700 hover:text-indigo-500 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Card view for products
  const renderCard = (p) => (
    <div
      key={p._id}
      className="bg-white border rounded-lg shadow p-4 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        {Array.isArray(p.images) && p.images[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            className="w-16 h-16 object-cover rounded mr-2"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
            No image
          </div>
        )}
        <h2 className="text-lg font-bold truncate">{p.name}</h2>
      </div>
      <p className="text-indigo-700 font-bold text-lg">
        ${Number(p.price).toFixed(2)}
      </p>
      <p>
        Stock: <span className="font-bold">{p.countInStock}</span>
      </p>
      <p className="text-sm text-gray-500">Category: {p.category || "-"}</p>
      <button
        onClick={() => quickToggleFeatured(p)}
        className={`rounded px-3 py-1 text-xs font-bold ${
          p.isFeatured
            ? "bg-indigo-100 text-indigo-700"
            : "bg-gray-200 text-gray-500"
        } transition`}
      >
        {p.isFeatured ? "Featured" : "Not Featured"}
      </button>
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => openEditModal(p)}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(p._id)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 font-semibold rounded ${
            activeTab === "products"
              ? "bg-indigo-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("products")}
        >
          Manage Products
        </button>
        <button
          className={`px-4 py-2 font-semibold rounded ${
            activeTab === "orders"
              ? "bg-indigo-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Manage Orders
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-extrabold text-gray-800 select-none">
              Admin Dashboard – Products
            </h1>
            <button
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-5 py-2 rounded shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={openCreateModal}
            >
              + Add Product
            </button>
          </div>
          {loading && (
            <p className="text-indigo-600 font-semibold">Loading products...</p>
          )}
          {error && (
            <p className="text-red-600 font-semibold">Error: {error}</p>
          )}
          {!loading && products.length > 0 && (
            <>
              <div className="hidden md:block">{renderTable()}</div>
              <div className="grid gap-4 md:hidden">
                {products.map(renderCard)}
              </div>
            </>
          )}
          {!loading && products.length === 0 && (
            <p className="text-gray-500 mt-12 text-center text-xl">
              No products yet.
            </p>
          )}
        </>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && <AdminOrders />}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !formSubmitting && setModalOpen(false)}
      >
        <h2 className="text-xl font-bold mb-4 select-none">
          {modalMode === "create" ? "Add New Product" : "Edit Product"}
        </h2>
        <form onSubmit={handleFormSubmit} noValidate>
          {/* Name */}
          <div className="mb-3">
            <label htmlFor="name" className="block font-semibold mb-1">
              Name<span className="text-red-600">*</span>
            </label>
            <input
              autoFocus
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                formErrors.name
                  ? "border-red-500 ring-red-300"
                  : "border-gray-300 ring-indigo-300"
              }`}
              required
            />
            {formErrors.name && (
              <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Price */}
          <div className="mb-3">
            <label htmlFor="price" className="block font-semibold mb-1">
              Price<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                formErrors.price
                  ? "border-red-500 ring-red-300"
                  : "border-gray-300 ring-indigo-300"
              }`}
              required
            />
            {formErrors.price && (
              <p className="text-red-600 text-sm mt-1">{formErrors.price}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-3">
            <label htmlFor="description" className="block font-semibold mb-1">
              Description<span className="text-red-600">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                formErrors.description
                  ? "border-red-500 ring-red-300"
                  : "border-gray-300 ring-indigo-300"
              }`}
              required
            />
            {formErrors.description && (
              <p className="text-red-600 text-sm mt-1">
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Count in Stock */}
          <div className="mb-3">
            <label htmlFor="countInStock" className="block font-semibold mb-1">
              Stock<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="countInStock"
              name="countInStock"
              min="0"
              value={formData.countInStock}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                formErrors.countInStock
                  ? "border-red-500 ring-red-300"
                  : "border-gray-300 ring-indigo-300"
              }`}
              required
            />
            {formErrors.countInStock && (
              <p className="text-red-600 text-sm mt-1">
                {formErrors.countInStock}
              </p>
            )}
          </div>

          {/* Images */}
          <div className="mb-3">
            <label htmlFor="images" className="block font-semibold mb-1">
              Images<span className="text-red-600">*</span>
              <span className="block text-xs text-gray-500">
                Multiple URLs, separated by comma
              </span>
            </label>
            <input
              type="text"
              id="images"
              name="images"
              value={formData.images.join(",")}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                formErrors.images
                  ? "border-red-500 ring-red-300"
                  : "border-gray-300 ring-indigo-300"
              }`}
              required
            />
            {formErrors.images && (
              <p className="text-red-600 text-sm mt-1">{formErrors.images}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-3">
            <label htmlFor="category" className="block font-semibold mb-1">
              Category<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                formErrors.category
                  ? "border-red-500 ring-red-300"
                  : "border-gray-300 ring-indigo-300"
              }`}
              required
            />
            {formErrors.category && (
              <p className="text-red-600 text-sm mt-1">{formErrors.category}</p>
            )}
          </div>

          {/* Featured */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isFeatured" className="font-semibold select-none">
              Featured
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => !formSubmitting && setModalOpen(false)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-60"
              disabled={formSubmitting}
            >
              {formSubmitting
                ? modalMode === "create"
                  ? "Creating…"
                  : "Updating…"
                : modalMode === "create"
                ? "Create Product"
                : "Update Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
