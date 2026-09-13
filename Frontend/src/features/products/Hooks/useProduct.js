import { useDispatch, useSelector } from 'react-redux';
import {
  createProduct as createProductApi,
  getSellerProducts as getSellerProductsApi,
  getAllProducts as getAllProductsApi,
  getProductById as getProductByIdApi,
  updateProduct as updateProductApi,
} from '../services/product.api.js';
import {
  setProducts,
  setSellerProducts,
  setCurrentProduct,
  addProduct,
  setLoading,
  setError,
  setSuccessMessage,
  clearProductMessages,
} from '../state/product.slice.js';

export const useProduct = () => {
  const dispatch = useDispatch();
  const { products, sellerProduct, currentProduct, loading, error, successMessage } = useSelector((state) => state.products || {});

  const handleCreateProduct = async (formData) => {
    dispatch(setLoading(true));
    dispatch(clearProductMessages());
    try {
      const data = await createProductApi(formData);
      if (data.product) {
        dispatch(addProduct(data.product));
      }
      const msg = data.message || 'Product published successfully!';
      dispatch(setSuccessMessage(msg));
      dispatch(setLoading(false));
      return { success: true, data: data.product, message: msg };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to create product';
      dispatch(setError(msg));
      dispatch(setLoading(false));
      return { success: false, error: msg };
    }
  };

  const handleUpdateProduct = async (productId, updateData) => {
    dispatch(setLoading(true));
    dispatch(clearProductMessages());
    try {
      const data = await updateProductApi(productId, updateData);
      if (data.product) {
        dispatch(setCurrentProduct(data.product));
      }
      const msg = data.message || 'Product & inventory updated successfully!';
      dispatch(setSuccessMessage(msg));
      dispatch(setLoading(false));
      return { success: true, data: data.product, message: msg };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to update product';
      dispatch(setError(msg));
      dispatch(setLoading(false));
      return { success: false, error: msg };
    }
  };

  const handleGetProducts = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getAllProductsApi();
      dispatch(setProducts(data.products || []));
      dispatch(setLoading(false));
      return { success: true, data: data.products };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch products';
      dispatch(setError(msg));
      dispatch(setLoading(false));
      return { success: false, error: msg };
    }
  };

  const handleGetProductById = async (productId) => {
    dispatch(setLoading(true));
    try {
      const data = await getProductByIdApi(productId);
      dispatch(setCurrentProduct(data.product));
      dispatch(setLoading(false));
      return { success: true, data: data.product };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch product details';
      dispatch(setError(msg));
      dispatch(setLoading(false));
      return { success: false, error: msg };
    }
  };

  const handleGetSellerProducts = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getSellerProductsApi();
      dispatch(setSellerProducts(data.products || []));
      dispatch(setLoading(false));
      return { success: true, data: data.products };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch seller products';
      dispatch(setError(msg));
      dispatch(setLoading(false));
      return { success: false, error: msg };
    }
  };

  const clearMessages = () => {
    dispatch(clearProductMessages());
  };

  return {
    handleCreateProduct,
    handleUpdateProduct,
    handleGetProducts,
    handleGetProductById,
    handleGetSellerProducts,
    products,
    sellerProduct,
    currentProduct,
    loading,
    error,
    successMessage,
    clearMessages,
  };
};

export default useProduct;

