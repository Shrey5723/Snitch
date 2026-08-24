import {body, validationResult} from 'express-validator';

function validator(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const validateRegister = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('contactNumber')
        .notEmpty().withMessage('Contact number is required'),
    body('fullName')
        .notEmpty().withMessage('Full name is required'),
    body('role')
        .optional()
        .isIn(['buyer', 'seller']).withMessage('Role must be either buyer or seller'),
    body("isSeller")
        .optional()
        .isBoolean().withMessage("isSeller must be a boolean value"),
    validator
];

export const validateLogin = [
    body('identifier')
        .optional()
        .trim(),
    body('email')
        .optional()
        .trim(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validator
];  