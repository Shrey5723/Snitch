import { body, validationResult } from 'express-validator';

function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
}

export const createProductValidator = [
    body('title ')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long')
    ,
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 3 }).withMessage('Description must be at least 3 characters long')
    ,
    body('priceAmount')
        .trim()
        .notEmpty().withMessage('Price is required')
        .isNumeric().withMessage('Price must be a number')
        .isLength({ min: 1 }).withMessage('Price must be at least 1 digit')
    ,
    body('priceCurrency')
        .trim()
        .notEmpty().withMessage('Currency is required')
        .isLength({ min: 3 }).withMessage('Currency must be at least 3 characters long')
    ,
    validateRequest,
]