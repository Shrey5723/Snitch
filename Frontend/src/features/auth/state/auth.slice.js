import { createSlice } from '@reduxjs/toolkit';

const getSavedToken = () => {
  try {
    return localStorage.getItem('snitch_token') || null;
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: getSavedToken(),
    isAuthenticated: false,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload?.user || action.payload;
      const newToken = action.payload?.token || state.token;
      state.token = newToken;
      if (action.payload?.token) {
        try {
          localStorage.setItem('snitch_token', action.payload.token);
        } catch (e) {
          console.warn('Could not persist token:', e);
        }
      }
      state.isAuthenticated = Boolean(action.payload);
      state.error = null;
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
    clearAuthMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.successMessage = null;
      try {
        localStorage.removeItem('snitch_token');
      } catch (e) {
        console.warn('Could not remove token:', e);
      }
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  setSuccessMessage,
  clearAuthMessages,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
