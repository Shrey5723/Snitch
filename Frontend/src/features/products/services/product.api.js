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