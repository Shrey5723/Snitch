import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
  placeOrderApi,
  getMyOrdersApi,
  toggleLikeApi,
  getLikedProductsApi,
} from '../services/cart.api.js';

// Async Thunks connecting directly to MongoDB
export const fetchCartThunk = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCartApi();
      return data.cart?.items || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addToCartThunk = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, size = 'M', color = 'Black' }, { rejectWithValue }) => {
    try {
      const data = await addToCartApi({ productId, quantity, size, color });
      return data.cart?.items || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCartItemThunk = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, productId, size, color, quantity }, { rejectWithValue }) => {
    try {
      const data = await updateCartItemApi({ itemId, productId, size, color, quantity });
      return data.cart?.items || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeFromCartThunk = createAsyncThunk(
  'cart/removeFromCart',
  async ({ itemId, productId, size, color }, { rejectWithValue }) => {
    try {
      const data = await removeFromCartApi({ itemId, productId, size, color });
      return data.cart?.items || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const clearCartThunk = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await clearCartApi();
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const placeOrderThunk = createAsyncThunk(
  'cart/placeOrder',
  async (orderData = {}, { rejectWithValue }) => {
    try {
      const data = await placeOrderApi(orderData);
      return data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchOrdersThunk = createAsyncThunk(
  'cart/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMyOrdersApi();
      return data.orders || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleLikeThunk = createAsyncThunk(
  'cart/toggleLike',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await toggleLikeApi(productId);
      return { productId, isLiked: data.isLiked, wishlist: data.wishlist };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchLikesThunk = createAsyncThunk(
  'cart/fetchLikes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getLikedProductsApi();
      const ids = (data.wishlist || []).map((item) => (typeof item === 'object' ? item._id : item));
      return ids;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],           // Array of { _id, product, quantity, size, color }
    orders: [],          // Past orders from MongoDB
    wishlist: [],        // Array of liked product ID strings
    loading: false,
    orderLoading: false,
    orderPlaced: false,
    orderMessage: null,
    error: null,
  },
  reducers: {
    clearOrderMessage: (state) => {
      state.orderPlaced = false;
      state.orderMessage = null;
    },
    resetCart: (state) => {
      state.items = [];
      state.orders = [];
      state.wishlist = [];
      state.orderPlaced = false;
      state.orderMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder.addCase(fetchCartThunk.fulfilled, (state, action) => {
      state.items = action.payload;
    });

    // Add to cart
    builder.addCase(addToCartThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addToCartThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(addToCartThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update cart
    builder.addCase(updateCartItemThunk.fulfilled, (state, action) => {
      state.items = action.payload;
    });

    // Remove from cart
    builder.addCase(removeFromCartThunk.fulfilled, (state, action) => {
      state.items = action.payload;
    });

    // Clear cart
    builder.addCase(clearCartThunk.fulfilled, (state) => {
      state.items = [];
    });

    // Place order
    builder.addCase(placeOrderThunk.pending, (state) => {
      state.orderLoading = true;
      state.error = null;
    });
    builder.addCase(placeOrderThunk.fulfilled, (state, action) => {
      state.orderLoading = false;
      state.orderPlaced = true;
      state.orderMessage = `Order ${action.payload?.orderNumber || ''} placed successfully!`;
      state.items = [];
      state.orders.unshift(action.payload);
    });
    builder.addCase(placeOrderThunk.rejected, (state, action) => {
      state.orderLoading = false;
      state.error = action.payload;
    });

    // Fetch orders
    builder.addCase(fetchOrdersThunk.fulfilled, (state, action) => {
      state.orders = action.payload;
    });

    // Toggle like
    builder.addCase(toggleLikeThunk.fulfilled, (state, action) => {
      const { productId, isLiked, wishlist } = action.payload;
      if (wishlist) {
        state.wishlist = wishlist.map((id) => id.toString());
      } else if (isLiked) {
        if (!state.wishlist.includes(productId)) state.wishlist.push(productId);
      } else {
        state.wishlist = state.wishlist.filter((id) => id !== productId);
      }
    });

    // Fetch likes
    builder.addCase(fetchLikesThunk.fulfilled, (state, action) => {
      state.wishlist = action.payload.map((id) => id.toString());
    });
  },
});

export const { clearOrderMessage, resetCart } = cartSlice.actions;

export default cartSlice.reducer;
