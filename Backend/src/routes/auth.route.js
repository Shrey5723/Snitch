import { Router } from 'express';
import passport from 'passport';
import { validateRegister, validateLogin } from '../validator/auth.validator.js';
import {authorizeRole}    from "../middleware/auth.middleware.js"
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getMe, 
    googleCallback 
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/logout', logoutUser);
router.get('/get-me',protect, getMe);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    googleCallback
);

export default router;