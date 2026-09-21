import express from 'express';
import { authorizeRole } from '../middleware/auth.middleware.js';
import { placeOrder, getMyOrders } from '../controllers/order.controller.js';

const router = express.Router();

router.use(authorizeRole(['buyer']));

router.post('/', placeOrder);
router.get('/my-orders', getMyOrders);

export default router;
