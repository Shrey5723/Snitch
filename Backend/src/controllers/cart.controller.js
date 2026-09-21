import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';

// Get current buyer's cart
export const getCart = async (req, res) => {
    try {
        let cart = await cartModel.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            cart = await cartModel.create({ user: req.user._id, items: [] });
        }
        res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve cart',
            error: error.message
        });
    }
};

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, size = 'M', color = 'Black' } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Determine available stock for selected size
        const availableStock = (product.sizeStock && product.sizeStock[size] !== undefined)
            ? product.sizeStock[size]
            : (product.stock || 0);

        if (availableStock <= 0) {
            return res.status(400).json({
                success: false,
                message: `Size ${size} for "${product.title}" is currently out of stock`,
            });
        }

        let cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            cart = await cartModel.create({ user: req.user._id, items: [] });
        }

        const existingIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId.toString() && item.size === size && item.color === color
        );

        const reqQty = Math.max(1, Number(quantity) || 1);
        const currentQty = existingIndex > -1 ? cart.items[existingIndex].quantity : 0;

        if (currentQty + reqQty > availableStock) {
            return res.status(400).json({
                success: false,
                message: `Cannot add ${reqQty} item(s). Only ${availableStock} available for size ${size}${currentQty > 0 ? ` (${currentQty} already in bag)` : ''}.`,
            });
        }

        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += reqQty;
        } else {
            cart.items.push({
                product: productId,
                quantity: reqQty,
                size,
                color,
            });
        }

        await cart.save();
        cart = await cartModel.findById(cart._id).populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message,
        });
    }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { itemId, productId, size, color, quantity } = req.body;

        let cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        let targetIndex = -1;
        if (itemId) {
            targetIndex = cart.items.findIndex((item) => item._id.toString() === itemId.toString());
        } else if (productId) {
            targetIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId.toString() &&
                          (!size || item.size === size) &&
                          (!color || item.color === color)
            );
        }

        if (targetIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        const newQty = Number(quantity);
        const item = cart.items[targetIndex];

        if (newQty <= 0) {
            cart.items.splice(targetIndex, 1);
        } else {
            // Verify available stock before incrementing
            const product = await productModel.findById(item.product);
            if (product) {
                const availableStock = (product.sizeStock && product.sizeStock[item.size] !== undefined)
                    ? product.sizeStock[item.size]
                    : (product.stock || 0);

                if (newQty > availableStock) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot set quantity to ${newQty}. Maximum available stock for size ${item.size} is ${availableStock}.`,
                    });
                }
            }
            cart.items[targetIndex].quantity = newQty;
        }

        await cart.save();
        cart = await cartModel.findById(cart._id).populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            error: error.message
        });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { itemId, productId, size, color } = req.body;

        let cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        if (itemId) {
            cart.items = cart.items.filter((item) => item._id.toString() !== itemId.toString());
        } else if (productId) {
            cart.items = cart.items.filter(
                (item) => !(item.product.toString() === productId.toString() &&
                            (!size || item.size === size) &&
                            (!color || item.color === color))
            );
        }

        await cart.save();
        cart = await cartModel.findById(cart._id).populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
};

// Clear all items in cart
export const clearCart = async (req, res) => {
    try {
        let cart = await cartModel.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            cart: cart || { items: [] }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};
