// @/redux/reducer/CartReducer.js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [], // Cart items
    total_amount: 0, // Total cart amount
    isLoading: false, // Loading state for async actions
    error: null, // Error state
  },
  reducers: {
    cartRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    cartRequestOut(state) {
      state.isLoading = false;
    },
    setCartError(state, action) {
      state.isLoading = false;
      state.error = action.payload || "An error occurred";
    },
    addToCart(state, action) {
      state.cart.push(action.payload);
      state.total_amount = state.cart.reduce(
        (total, item) => total + (item.product?.price || 0) * (item.amount || 1),
        0
      );
    },
    toggleCartAmount(state, action) {
      const { id, value } = action.payload;
      const item = state.cart.find((item) => item.id === id);
      if (item) {
        if (value === "inc") {
          item.amount = (item.amount || 1) + 1;
        } else if (value === "dec" && item.amount > 1) {
          item.amount -= 1;
        }
        state.total_amount = state.cart.reduce(
          (total, item) => total + (item.product?.price || 0) * (item.amount || 1),
          0
        );
      }
    },
    removeFromCart(state, action) {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
      state.total_amount = state.cart.reduce(
        (total, item) => total + (item.product?.price || 0) * (item.amount || 1),
        0
      );
    },
    countCartTotals(state) {
      state.total_amount = state.cart.reduce(
        (total, item) => total + (item.product?.price || 0) * (item.amount || 1),
        0
      );
    },
  },
});

export const {
  cartRequest,
  cartRequestOut,
  setCartError,
  addToCart,
  toggleCartAmount,
  removeFromCart,
  countCartTotals,
} = cartSlice.actions;
export default cartSlice.reducer;