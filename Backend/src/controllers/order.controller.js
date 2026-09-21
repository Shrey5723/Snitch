import orderModel from '../models/order.model.js';
import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';

export const placeOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        const cart = await cartModel.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty'
            });
        }

        // Pre-flight stock verification
        for (const item of cart.items) {
            if (!item.product) continue;
            const prod = await productModel.findById(item.product._id);
            if (!prod) {
                return res.status(400).json({
                    success: false,
                    message: `Product is no longer available`,
                });
            }

            const available = (prod.sizeStock && prod.sizeStock[item.size] !== undefined)
                ? prod.sizeStock[item.size]
                : (prod.stock || 0);

            if (available < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: available <= 0
                        ? `"${prod.title}" (Size ${item.size}) is out of stock. Please remove it from your bag.`
                        : `Only ${available} unit(s) available for "${prod.title}" (Size ${item.size}). You requested ${item.quantity}.`,
                });
            }
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            if (!item.product) continue;

            const price = typeof item.product.price === 'object' ? item.product.price.amount : Number(item.product.price);
            const itemTotal = (price || 0) * item.quantity;
            totalAmount += itemTotal;

            const imgUrl = item.product.images && item.product.images.length > 0
                ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url)
                : '';

            orderItems.push({
                product: item.product._id,
                title: item.product.title,
                price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                image: imgUrl,
            });

            // Adjust inventory stock in MongoDB
            try {
                const prod = await productModel.findById(item.product._id);
                if (prod) {
                    if (prod.sizeStock && prod.sizeStock[item.size] !== undefined) {
                        prod.sizeStock[item.size] = Math.max(0, prod.sizeStock[item.size] - item.quantity);
                    }
                    if (prod.sizeStock) {
                        prod.stock = Object.values(prod.sizeStock).reduce((sum, val) => sum + (Number(val) || 0), 0);
                    } else {
                        prod.stock = Math.max(0, (prod.stock || 0) - item.quantity);
                    }

                    if (prod.stock === 0) {
                        prod.status = 'Out of Stock';
                    } else if (prod.stock <= 10) {
                        prod.status = 'Low Stock';
                    } else {
                        prod.status = 'In Stock';
                    }
                    await prod.save();
                }
            } catch (err) {
                console.error(`Failed to decrement stock for product ${item.product._id}:`, err);
            }
        }

        // Apply shipping calculation
        const shipping = totalAmount > 1999 ? 0 : 149;
        const grandTotal = totalAmount + shipping;

        const orderNumber = `SNITCH-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const order = await orderModel.create({
            user: req.user._id,
            orderNumber,
            items: orderItems,
            totalAmount: grandTotal,
            shippingAddress: shippingAddress || {},
            status: 'Confirmed'
        });

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            message: `Order ${orderNumber} placed successfully!`,
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to place order',
            error: error.message
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders',
            error: error.message
        });
    }
};
