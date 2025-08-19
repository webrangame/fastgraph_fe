// @/redux/action/CartAction.js
import {
  cartRequest,
  cartRequestOut,
  setCartError,
  addToCart,
  toggleCartAmount,
  removeFromCart,
  countCartTotals,
} from "../reducer/CartReducer";

export const addToCartAction = (id, amount, product) => async (dispatch) => {
  try {
    dispatch(cartRequest());
    dispatch(addToCart({ id, amount, product }));
    dispatch(countCartTotals()); // Recalculate totals after adding
    dispatch(cartRequestOut());
  } catch (error) {
    console.error(error);
    dispatch(setCartError(error.message));
  }
};

export const toggleAmount = (id, value) => async (dispatch) => {
  try {
    dispatch(cartRequest());
    dispatch(toggleCartAmount({ id, value }));
    dispatch(countCartTotals()); // Recalculate totals after toggling
    dispatch(cartRequestOut());
  } catch (error) {
    console.error(error);
    dispatch(setCartError(error.message));
  }
};

export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch(cartRequest());
    dispatch(removeFromCart(id));
    dispatch(countCartTotals()); // Recalculate totals after deletion
    dispatch(cartRequestOut());
  } catch (error) {
    console.error(error);
    dispatch(setCartError(error.message));
  }
};

export { countCartTotals };