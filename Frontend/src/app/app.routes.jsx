import React from 'react';
import { createBrowserRouter } from 'react-router';
import Home from '../features/products/pages/Home.jsx';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import CreateProduct from '../features/products/pages/CreateProduct.jsx';
import ViewAllProducts from '../features/products/pages/ViewAllProducts.jsx';
import ProductDetail from '../features/products/pages/ProductDetail.jsx';
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
    path: '/product/:productId',
    element: <ProductDetail />,
  },

  {
    path: '/products/create',
    element: <Protected><CreateProduct /></Protected>,
  },
  {
    path: '/create-product',
    element: <Protected><CreateProduct /></Protected>,
  },
  {
    path: '/products',
    element: <Protected><ViewAllProducts /></Protected>,
  },
  {
    path: '/seller/products',
    element: <Protected><ViewAllProducts /></Protected>,
  },
  {
    path: '/view-all-products',
    element: <Protected><ViewAllProducts /></Protected>,
  },
]);

export default router;
