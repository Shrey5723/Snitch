import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import Home from '../features/products/pages/Home.jsx';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import Profile from '../features/auth/pages/Profile.jsx';
import CreateProduct from '../features/products/pages/CreateProduct.jsx';
import ProductDetail from '../features/products/pages/ProductDetail.jsx';
import Cart from '../features/products/pages/Cart.jsx';
import SellerDashboard from '../features/products/pages/SellerDashboard.jsx';
import SellerProductDetails from '../features/products/pages/SellerProductDetails.jsx';
import Protected from '../features/auth/components/Protected.jsx';

export const router = createBrowserRouter([
  // Public Catalog & Home
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/view-all-products',
    element: <Navigate to="/" replace />,
  },

  // Auth Routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },

  // Buyer Shopping Bag & Checkout (Buyer Only)
  {
    path: '/cart',
    element: (
      <Protected requireBuyer={true} requireAuth={true}>
        <Cart />
      </Protected>
    ),
  },
  {
    path: '/product/:productId',
    element: <ProductDetail />,
  },

  // Seller Dashboard, Inventory & Management (Seller Only)
  {
    path: '/seller/dashboard',
    element: (
      <Protected requireSeller={true}>
        <SellerDashboard />
      </Protected>
    ),
  },
  {
    path: '/seller',
    element: (
      <Protected requireSeller={true}>
        <SellerDashboard />
      </Protected>
    ),
  },
  {
    path: '/seller/products',
    element: (
      <Protected requireSeller={true}>
        <SellerDashboard />
      </Protected>
    ),
  },
  {
    path: '/products',
    element: (
      <Protected requireSeller={true}>
        <SellerDashboard />
      </Protected>
    ),
  },
  {
    path: '/products/create',
    element: (
      <Protected requireSeller={true}>
        <CreateProduct />
      </Protected>
    ),
  },
  {
    path: '/create-product',
    element: (
      <Protected requireSeller={true}>
        <CreateProduct />
      </Protected>
    ),
  },
  {
    path: '/seller/product/:productId',
    element: (
      <Protected requireSeller={true}>
        <SellerProductDetails />
      </Protected>
    ),
  },
  {
    path: '/seller/products/:productId',
    element: (
      <Protected requireSeller={true}>
        <SellerProductDetails />
      </Protected>
    ),
  },
]);

export default router;
