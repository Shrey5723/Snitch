import productModel from '../models/product.model.js';

export const createProduct = async (req, res) => {
    try {
        const { title, description, price, images } = req.body;

        const product = await productModel.create({
            title,
            description,
            seller: req.user._id,
            price,
            images,
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message,
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await productModel.find().populate('seller', 'fullName email avatar');
        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message,
        });
    }
};
