import React from 'react';
import { createBrowserRouter } from 'react-router';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <h1>Hello World!!</h1>,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);

export default router;
