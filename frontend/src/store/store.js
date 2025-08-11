import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import adminProductsReducer from "../features/admin/adminProductSlice";
import adminOrdersReducer from "../features/admin/adminOrdersSlice";
import userProfileReducer from "../features/user/userProfileSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    adminProducts: adminProductsReducer,
    adminOrders: adminOrdersReducer,
    userProfile: userProfileReducer,
  },
});
