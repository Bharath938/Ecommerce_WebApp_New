// src/features/admin/adminProductsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig";

/**
 * FETCH all products for admin
 */
export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchAll",
  async (_, { rejectWithValue }) => {
    console.log("supoerb");
    try {
      const { data } = await axios.get(
        "https://ecommerce-web-app-new.vercel.app/api/products"
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data.message || err.message);
    }
  }
);

/**
 * CREATE a new product
 */
export const createProduct = createAsyncThunk(
  "adminProducts/create",
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "https://ecommerce-web-app-new.vercel.app/api/products",
        productData
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data.message || err.message);
    }
  }
);

/**
 * UPDATE an existing product
 */
export const updateProduct = createAsyncThunk(
  "adminProducts/update",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `https://ecommerce-web-app-new.vercel.app/api/products/${id}`,
        productData
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data.message || err.message);
    }
  }
);

/**
 * DELETE a product
 */
export const deleteProduct = createAsyncThunk(
  "adminProducts/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `https://ecommerce-web-app-new.vercel.app/api/products/${id}`
      );
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data.message || err.message);
    }
  }
);

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // create
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // delete
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminProductsError } = adminProductsSlice.actions;
export default adminProductsSlice.reducer;
