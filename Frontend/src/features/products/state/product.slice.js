import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    sellerProduct: [],
    currentProduct: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.products || [];
    },
    setSellerProducts: (state, action) => {
      state.sellerProduct = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.products || [];
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload?.product || action.payload;
    },
    addProduct: (state, action) => {
      if (action.payload) {
        state.sellerProduct.unshift(action.payload);
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    clearProductMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
});

export const {
  setProducts,
  setSellerProducts,
  setCurrentProduct,
  addProduct,
  setLoading,
  setError,
  setSuccessMessage,
  clearProductMessages,
} = productSlice.actions;

export default productSlice.reducer;