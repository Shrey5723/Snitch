import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './app.routes.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../features/auth/Hooks/useAuth';
import {
  fetchCartThunk,
  fetchLikesThunk,
  fetchOrdersThunk,
  resetCart,
} from '../features/products/state/cart.slice.js';

function App() {
  const dispatch = useDispatch();
  const { handleGetMe } = useAuth();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    handleGetMe();
  }, []);

  // Sync MongoDB cart, wishlist, and orders when buyer is logged in
  useEffect(() => {
    if (user && user.role === 'buyer') {
      dispatch(fetchCartThunk());
      dispatch(fetchLikesThunk());
      dispatch(fetchOrdersThunk());
    } else if (!user) {
      dispatch(resetCart());
    }
  }, [user, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
