import axios from 'axios'

const productApiInstance = axios.create({
    baseURL: '/api/products',
    withCredentials: true,
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

export async function createProduct(formData) {
    try {
        const response = await productApiInstance.post('/', formData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getSellerProducts() {
    try {
        const response = await productApiInstance.get('/seller');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getAllProducts() {
    try {
        const response = await productApiInstance.get('/all');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getProductById(productId) {
    try {
        const response = await productApiInstance.get(`/${productId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function updateProduct(productId, productData) {
    try {
        const response = await productApiInstance.put(`/${productId}`, productData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}