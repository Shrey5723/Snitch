import { body, validationResult } from 'express-validator';

function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg).join(', ');
        return res.status(400).json({
            success: false,
            message: errorMessages || 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
}

export const createProductValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Product title is required')
        .isLength({ min: 3 }).withMessage('Product title must be at least 3 characters long'),
    body('description')
        .trim()
        .notEmpty().withMessage('Product description is required')
        .isLength({ min: 3 }).withMessage('Description must be at least 3 characters long'),
    body('priceAmount')
        .notEmpty().withMessage('Retail price is required')
        .isNumeric().withMessage('Retail price must be a valid number'),
    body('priceCurrency')
        .trim()
        .notEmpty().withMessage('Currency code is required')
        .isLength({ min: 3 }).withMessage('Currency must be at least 3 characters long'),
    validateRequest,
];