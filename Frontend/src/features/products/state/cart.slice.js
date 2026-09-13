import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],       // Array of { product, quantity, size, color }
    orders: [],      // Array of past orders { id, items, total, date, status }
    orderPlaced: false,
    orderMessage: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, size = 'M', color = 'Black' } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product._id === product._id && item.size === size && item.color === color
      );
      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({ product, quantity, size, color });
      }
    },
    removeFromCart: (state, action) => {
      const { productId, size, color } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.product._id === productId && item.size === size && item.color === color)
      );
    },
    updateQuantity: (state, action) => {
      const { productId, size, color, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.product._id === productId && i.size === size && i.color === color
      );
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.orderPlaced = false;
      state.orderMessage = null;
    },
    placeOrder: (state) => {
      const total = state.items.reduce((sum, item) => {
        const price = typeof item.product?.price === 'object' ? item.product.price.amount : item.product?.price;
        return sum + (price || 0) * item.quantity;
      }, 0);

      const order = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        items: [...state.items],
        total,
        date: new Date().toISOString(),
        status: 'Confirmed',
      };

      state.orders.unshift(order);
      state.orderPlaced = true;
      state.orderMessage = `Order ${order.id} placed successfully! ${state.items.length} item(s) will be delivered within 5-7 business days.`;
      state.items = [];
    },
    clearOrderMessage: (state) => {
      state.orderPlaced = false;
      state.orderMessage = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  placeOrder,
  clearOrderMessage,
} = cartSlice.actions;

export default cartSlice.reducer;
