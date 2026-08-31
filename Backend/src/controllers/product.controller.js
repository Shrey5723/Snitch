import productModel from '../models/product.model.js';

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency } = req.body;

        const images = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname,
                folder: 'snitch/products'
            })
        }));


        const product = await productModel.create({
            title,
            description,
            seller: req.user._id,
            price: {
                amount: Number(priceAmount),
                currency: priceCurrency,
            },
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

    const seller = req.user

    try {
        const products = await productModel.find({ seller: seller._id });
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

export const getAllProducts = async (req, res) => {
    try {
        const products = await productModel
            .find({})
            .populate('seller', 'fullName')
            .sort({ createdAt: -1 });
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

export const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await productModel
            .findById(productId)
            .populate('seller', 'fullName email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product details',
            error: error.message,
        });
    }
};

