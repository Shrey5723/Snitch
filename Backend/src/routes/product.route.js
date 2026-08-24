import express from 'express';
import { authorizeRole } from '../middleware/auth.middleware.js';
import { createProduct, getProducts } from '../controllers/product.controller.js';
import multer from 'multer';
import { createProductValidator } from '../validator/product.validator.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 7 * 1024 * 1024
    }
});

const router = express.Router();

router.get('/', getProducts);
router.post('/', authorizeRole(['seller']), createProductValidator, upload.array('images', 7), createProduct);

export default router;
