import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './app.routes.jsx';
import {useSelector} from 'react-redux'
import {useAuth} from "../features/auth/Hooks/useAuth"

function App() {

  const {handleGetMe} = useAuth();
  const user = useSelector((state) => state.auth.user);

  
  // console.log(user);
  return <RouterProvider router={router} />;
}

export default App;
