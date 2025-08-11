import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig";

// Fetch cart items
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/cart");
      const cartItems = Array.isArray(data) ? data : data.items || [];
      return cartItems;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Add or update cart item
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("http://localhost:5000/api/cart", {
        productId,
        quantity,
      });
      return data; // { product, quantity }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Remove single item from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${productId}`);
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update quantity of existing cart item
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        { quantity }
      );
      return data; // updated cart item
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// OPTIONAL: Clear entire cart on backend as well
export const clearCartOnServer = createAsyncThunk(
  "cart/clearCartOnServer",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete("http://localhost:5000/api/cart"); // assumes API supports DELETE all
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  cartItems: [],
  totalQuantity: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError(state) {
      state.error = null;
    },
    // ✅ This will wipe cart instantly
    resetCart(state) {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const updateTotalQuantity = (state) => {
      state.totalQuantity = state.cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    };

    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
        updateTotalQuantity(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addToCart
      .addCase(addToCart.fulfilled, (state, action) => {
        const addedItem = action.payload;
        const existing = state.cartItems.find(
          (i) => i.product._id === addedItem.product._id
        );
        if (existing) {
          existing.quantity = addedItem.quantity;
        } else {
          state.cartItems.push(addedItem);
        }
        updateTotalQuantity(state);
      })

      // removeFromCart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const removedId = action.payload;
        state.cartItems = state.cartItems.filter(
          (i) => i.product._id !== removedId
        );
        updateTotalQuantity(state);
      })

      // updateCartItem
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const updated = action.payload;
        const existing = state.cartItems.find(
          (i) => i.product._id === updated.product._id
        );
        if (existing) {
          existing.quantity = updated.quantity;
        }
        updateTotalQuantity(state);
      })

      // clearCartOnServer
      .addCase(clearCartOnServer.fulfilled, (state) => {
        state.cartItems = [];
        state.totalQuantity = 0;
      });
  },
});

export const { clearCartError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
