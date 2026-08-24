import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import './config/passport.js';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js'
import { googleCallback } from './controllers/auth.controller.js';

const app = express();

app.use(morgan('dev'));
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.get('/', (req, res) => {
    res.send('Snitch API Server is Running');
});

// Primary auth routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes)

// Fallback alias for top-level OAuth callback
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=Google auth failed' }),
    googleCallback
);

export default app;