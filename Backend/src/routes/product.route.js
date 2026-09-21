import express from 'express';
import { authorizeRole } from '../middleware/auth.middleware.js';
import { createProduct, getProducts, getAllProducts, getProductById, updateProduct, toggleLikeProduct, getLikedProducts, rateProduct } from '../controllers/product.controller.js';
import multer from 'multer';
import { createProductValidator } from '../validator/product.validator.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit per image
    }
});

const handleUpload = (req, res, next) => {
    upload.array('images', 7)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('[MULTER UPLOAD ERROR]:', err);
            return res.status(400).json({
                success: false,
                message: `Image upload error: ${err.message}`,
                error: err.message,
            });
        } else if (err) {
            console.error('[GENERAL UPLOAD ERROR]:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload failed',
                error: err.message,
            });
        }
        next();
    });
};

const router = express.Router();

router.get('/all', getAllProducts);
router.get('/liked', authorizeRole(['buyer']), getLikedProducts);
router.get('/seller', authorizeRole(['seller']), getProducts);
router.get('/:productId', getProductById);
router.post('/:productId/like', authorizeRole(['buyer']), toggleLikeProduct);
router.post('/:productId/rate', authorizeRole(['buyer']), rateProduct);
router.put('/:productId', authorizeRole(['seller']), updateProduct);
router.post('/', authorizeRole(['seller']), handleUpload, createProductValidator, createProduct);

export default router;

