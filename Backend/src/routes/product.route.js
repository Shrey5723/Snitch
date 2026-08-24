import express from 'express';
import { authorizeRole } from '../middleware/auth.middleware.js';
import { createProduct, getProducts } from '../controllers/product.controller.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', authorizeRole(['seller']), createProduct);

export default router;
