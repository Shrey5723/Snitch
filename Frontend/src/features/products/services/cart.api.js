import axios from 'axios';

const attachAuthToken = (config) => {
    try {
        const token = localStorage.getItem('snitch_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch {
        // localStorage unavailable
    }
    return config;
};

const cartApi = axios.create({
    baseURL: '/api/cart',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
cartApi.interceptors.request.use(attachAuthToken);

const orderApi = axios.create({
    baseURL: '/api/orders',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
orderApi.interceptors.request.use(attachAuthToken);

const productApi = axios.create({
    baseURL: '/api/products',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
productApi.interceptors.request.use(attachAuthToken);

// Cart APIs
export async function getCartApi() {
    const response = await cartApi.get('/');
    return response.data;
}

export async function addToCartApi({ productId, quantity = 1, size = 'M', color = 'Black' }) {
    const response = await cartApi.post('/add', { productId, quantity, size, color });
    return response.data;
}

export async function updateCartItemApi({ itemId, productId, size, color, quantity }) {
    const response = await cartApi.put('/update', { itemId, productId, size, color, quantity });
    return response.data;
}

export async function removeFromCartApi({ itemId, productId, size, color }) {
    const response = await cartApi.post('/remove', { itemId, productId, size, color });
    return response.data;
}

export async function clearCartApi() {
    const response = await cartApi.delete('/clear');
    return response.data;
}

// Order APIs
export async function placeOrderApi(orderData = {}) {
    const response = await orderApi.post('/', orderData);
    return response.data;
}

export async function getMyOrdersApi() {
    const response = await orderApi.get('/my-orders');
    return response.data;
}

// Wishlist / Like APIs
export async function toggleLikeApi(productId) {
    const response = await productApi.post(`/${productId}/like`);
    return response.data;
}

export async function getLikedProductsApi() {
    const response = await productApi.get('/liked');
    return response.data;
}
