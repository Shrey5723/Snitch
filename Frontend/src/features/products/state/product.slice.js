import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    sellerProduct: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setSellerProducts: (state, action) => {
      state.sellerProduct = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.products || [];
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
  setSellerProducts,
  addProduct,
  setLoading,
  setError,
  setSuccessMessage,
  clearProductMessages,
} = productSlice.actions;

export default productSlice.reducer;