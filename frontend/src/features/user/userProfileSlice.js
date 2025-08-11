import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig";

// GET /api/users/profile
export const fetchUserProfile = createAsyncThunk(
  "userProfile/fetch",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      // ✅ Include token in headers
      const { data } = await axios.get(
        "https://ecommerce-web-app-new.vercel.app/api/user/profile",
        {
          headers: { Authorization: `Bearer ${auth.userInfo.token}` },
        }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// PUT /api/users/profile
export const updateUserProfile = createAsyncThunk(
  "userProfile/update",
  async (userData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const { data } = await axios.put(
        "https://ecommerce-web-app-new.vercel.app/api/user/profile",
        userData,
        {
          headers: { Authorization: `Bearer ${auth.userInfo.token}` },
        }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState: {
    user: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetProfileState: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetProfileState } = userProfileSlice.actions;
export default userProfileSlice.reducer;
