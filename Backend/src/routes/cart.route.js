import express from 'express';
import { authorizeRole } from '../middleware/auth.middleware.js';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cart.controller.js';

const router = express.Router();

// All cart endpoints require buyer role
router.use(authorizeRole(['buyer']));

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.post('/remove', removeFromCart);
router.delete('/clear', clearCart);

export default router;
