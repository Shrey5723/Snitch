import React from 'react';
import { createBrowserRouter } from 'react-router';
import Home from '../features/products/pages/Home.jsx';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import Profile from '../features/auth/pages/Profile.jsx';
import CreateProduct from '../features/products/pages/CreateProduct.jsx';
import ViewAllProducts from '../features/products/pages/ViewAllProducts.jsx';
import ProductDetail from '../features/products/pages/ProductDetail.jsx';
import Cart from '../features/products/pages/Cart.jsx';
import SellerProductDetails from '../features/products/pages/SellerProductDetails.jsx';
import Protected from '../features/auth/components/Protected.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
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
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/product/:productId',
    element: <ProductDetail />,
  },

  {
    path: '/products/create',
    element: <Protected requireSeller={true}><CreateProduct /></Protected>,
  },
  {
    path: '/create-product',
    element: <Protected requireSeller={true}><CreateProduct /></Protected>,
  },
  {
    path: '/products',
    element: <Protected requireSeller={true}><ViewAllProducts /></Protected>,
  },
  {
    path: '/seller/products',
    element: <Protected requireSeller={true}><ViewAllProducts /></Protected>,
  },
  {
    path: '/seller/product/:productId',
    element: <Protected requireSeller={true}><SellerProductDetails /></Protected>,
  },
  {
    path: '/seller/products/:productId',
    element: <Protected requireSeller={true}><SellerProductDetails /></Protected>,
  },
  {
    path: '/view-all-products',
    element: <Protected requireSeller={true}><ViewAllProducts /></Protected>,
  },
]);

export default router;
