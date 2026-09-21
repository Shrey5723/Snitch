import productModel from '../models/product.model.js';
import userModel from '../models/user.model.js';
import orderModel from '../models/order.model.js';
import { uploadFile } from '../services/storage.service.js';

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency, category, stock, sizeStock, colors, type, buildSummary } = req.body;

        console.log('[CREATE PRODUCT] Received request from:', req.user?.email, '| Files:', req.files?.length || 0);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one product image',
            });
        }

        // Upload images to ImageKit
        console.log('[CREATE PRODUCT] Uploading', req.files.length, 'images to ImageKit...');
        const images = [];
        for (const file of req.files) {
            try {
                console.log(`[CREATE PRODUCT] Uploading "${file.originalname}" (${file.mimetype}, ${file.size} bytes)...`);
                const uploaded = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                    folder: 'snitch/products'
                });
                images.push({
                    url: uploaded.url,
                    alt: file.originalname ? file.originalname.replace(/\.[^/.]+$/, "") : (title || 'Product image')
                });
                console.log(`[CREATE PRODUCT] ✅ Uploaded "${file.originalname}" → ${uploaded.url}`);
            } catch (uploadErr) {
                console.error(`[CREATE PRODUCT] ❌ Failed to upload "${file.originalname}":`, uploadErr);
                return res.status(500).json({
                    success: false,
                    message: uploadErr.message || `Failed to upload image "${file.originalname}"`,
                    error: uploadErr.message,
                });
            }
        }

        // Parse sizeStock and colors if they come as JSON strings (from FormData)
        let parsedSizeStock = undefined;
        if (sizeStock) {
            try {
                parsedSizeStock = typeof sizeStock === 'string' ? JSON.parse(sizeStock) : sizeStock;
            } catch (e) {
                parsedSizeStock = undefined;
            }
        }

        let parsedColors = undefined;
        if (colors) {
            try {
                parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
            } catch (e) {
                parsedColors = Array.isArray(colors) ? colors : [colors];
            }
        }

        // Calculate total stock from sizeStock if provided
        let totalStock = stock ? Number(stock) : 50;
        if (parsedSizeStock) {
            totalStock = Object.values(parsedSizeStock).reduce((acc, val) => acc + (Number(val) || 0), 0);
        }

        const product = await productModel.create({
            title,
            description,
            seller: req.user._id,
            price: {
                amount: Number(priceAmount),
                currency: priceCurrency,
            },
            category: category || 'Shirts',
            stock: totalStock,
            sizeStock: parsedSizeStock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
            colors: parsedColors || [],
            type: type || '',
            buildSummary: buildSummary || '',
            status: totalStock === 0 ? 'Out of Stock' : totalStock <= 10 ? 'Low Stock' : 'In Stock',
            images,
        });

        console.log('[CREATE PRODUCT] ✅ Product created:', product._id, product.title);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product,
        });

    } catch (error) {
        console.error('[CREATE PRODUCT] ❌ UNHANDLED ERROR:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create product',
            error: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        });
    }
};

export const getProducts = async (req, res) => {

    const seller = req.user

    try {
        const products = await productModel.find({ seller: seller._id }).sort({ createdAt: -1 });
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
            .find({ stock: { $gt: 0 }, status: { $ne: 'Out of Stock' } })
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
            .populate('seller', 'fullName email')
            .populate('ratings.user', 'fullName');

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

export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { title, description, priceAmount, priceCurrency, category, stock, sizeStock, status } = req.body;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Check if user is the seller who owns the product
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to modify this product',
            });
        }

        if (title !== undefined) product.title = title;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (status !== undefined) product.status = status;
        if (stock !== undefined) product.stock = Number(stock);
        if (sizeStock !== undefined) {
            product.sizeStock = {
                ...(product.sizeStock?.toObject ? product.sizeStock.toObject() : product.sizeStock),
                ...sizeStock
            };
            const total = Object.values(product.sizeStock).reduce((acc, val) => acc + (Number(val) || 0), 0);
            product.stock = total;
        }
        if (priceAmount !== undefined || priceCurrency !== undefined) {
            product.price = {
                amount: priceAmount !== undefined ? Number(priceAmount) : product.price.amount,
                currency: priceCurrency || product.price.currency || 'INR',
            };
        }

        // Handle new fields
        if (req.body.colors !== undefined) {
            product.colors = Array.isArray(req.body.colors) ? req.body.colors : [];
        }
        if (req.body.type !== undefined) {
            product.type = req.body.type;
        }
        if (req.body.buildSummary !== undefined) {
            product.buildSummary = req.body.buildSummary;
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product & stock updated successfully',
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message,
        });
    }
};

export const toggleLikeProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await userModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (!user.wishlist) user.wishlist = [];
        const index = user.wishlist.findIndex((id) => id.toString() === productId.toString());
        let isLiked = false;

        if (index > -1) {
            user.wishlist.splice(index, 1);
            isLiked = false;
        } else {
            user.wishlist.push(productId);
            isLiked = true;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: isLiked ? 'Added to favorites' : 'Removed from favorites',
            isLiked,
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle like',
            error: error.message
        });
    }
};

export const getLikedProducts = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate('wishlist');
        res.status(200).json({
            success: true,
            wishlist: user?.wishlist || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve wishlist',
            error: error.message
        });
    }
};

export const rateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 0 || numRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be a number between 0 and 5',
            });
        }

        // Check if buyer has purchased this product
        const purchase = await orderModel.findOne({
            user: req.user._id,
            'items.product': productId,
        });

        if (!purchase) {
            return res.status(403).json({
                success: false,
                message: 'Only buyers who have purchased this product can rate it',
            });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (!product.ratings) {
            product.ratings = [];
        }

        const existingIndex = product.ratings.findIndex(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (existingIndex > -1) {
            product.ratings[existingIndex].rating = numRating;
            product.ratings[existingIndex].comment = comment || '';
            product.ratings[existingIndex].createdAt = new Date();
        } else {
            product.ratings.push({
                user: req.user._id,
                rating: numRating,
                comment: comment || '',
                createdAt: new Date(),
            });
        }

        const sum = product.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        product.numReviews = product.ratings.length;
        product.avgRating = product.numReviews > 0 ? Number((sum / product.numReviews).toFixed(1)) : 0;

        await product.save();

        const populatedProduct = await productModel.findById(productId)
            .populate('seller', 'fullName email')
            .populate('ratings.user', 'fullName');

        res.status(200).json({
            success: true,
            message: existingIndex > -1 ? 'Rating updated successfully' : 'Thank you for your rating!',
            product: populatedProduct,
            avgRating: product.avgRating,
            numReviews: product.numReviews,
            userRating: numRating,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit rating',
            error: error.message,
        });
    }
};

