import axios from 'axios';

export const authApiInstance = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
});

authApiInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('snitch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage unavailable
  }
  return config;
});

export async function registerUser({ fullName, email, password, contactNumber, isSeller }) {
  try {
    const response = await authApiInstance.post('/register', {
      fullName,
      email,
      password,
      contactNumber,
      isSeller: Boolean(isSeller),
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
    throw new Error(message);
  }
}

export async function loginUser({ identifier, email, password, keepMeSignedIn }) {
  try {
    const response = await authApiInstance.post('/login', {
      identifier: identifier || email,
      email: identifier || email,
      password,
      keepMeSignedIn: Boolean(keepMeSignedIn),
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Invalid username/email or password';
    throw new Error(message);
  }
}

export async function logoutUser() {
  try {
    const response = await authApiInstance.post('/logout');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Logout failed';
    throw new Error(message);
  }
}

export async function getMe() {
  try {
    const response = await authApiInstance.get('/get-me');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to get authenticated user';
    throw new Error(message);
  }
}

export async function updateProfile({ fullName, contactNumber, addresses }) {
  try {
    const response = await authApiInstance.put('/update-profile', {
      fullName,
      contactNumber,
      addresses,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to update profile';
    throw new Error(message);
  }
}

export default {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  authApiInstance,
};