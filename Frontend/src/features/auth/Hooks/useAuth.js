import { useDispatch, useSelector } from 'react-redux';
import {
  setUser,
  setError,
  setLoading,
  setSuccessMessage,
  clearAuthMessages,
  logout,
} from '../state/auth.slice.js';
import { registerUser, loginUser, logoutUser, getMe } from '../services/auth.api.js';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error, successMessage } = useSelector(
    (state) => state.auth
  );

  async function handleRegister({ fullName, email, password, contactNumber, isSeller }) {
    dispatch(setLoading(true));
    dispatch(clearAuthMessages());
    try {
      const data = await registerUser({ fullName, email, password, contactNumber, isSeller });
      dispatch(setUser(data));
      dispatch(setSuccessMessage(data.message || 'Registration successful! Welcome to Snitch.'));
      return { success: true, data };
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ identifier, password, keepMeSignedIn }) {
    dispatch(setLoading(true));
    dispatch(clearAuthMessages());
    try {
      const data = await loginUser({ identifier, password, keepMeSignedIn });
      dispatch(setUser(data));
      dispatch(setSuccessMessage(data.message || 'Welcome back to Snitch!'));
      return { success: true, data };
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
    dispatch(setLoading(true));
    try {
      await logoutUser();
      dispatch(logout());
      return { success: true };
    } catch (err) {
      dispatch(logout());
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    dispatch(setLoading(true));
    try {
      const data = await getMe();
      dispatch(setUser({ user: data.user }));
      return { success: true, user: data.user };
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    successMessage,
    handleRegister,
    handleLogin,
    handleLogout,
    handleGetMe,
    clearMessages: () => dispatch(clearAuthMessages()),
  };
};

export default useAuth;