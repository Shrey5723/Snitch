import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

async function sendTokenResponse(user, res, customMessage = 'Authentication successful') {
    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        message: customMessage,
        success: true,
        token,
        user: {
            id: user._id,
            email: user.email,
            contactNumber: user.contactNumber,
            fullName: user.fullName,
            role: user.role,
            isSeller: user.role === 'seller',
            avatar: user.avatar,
        }
    });
}

export const registerUser = async (req, res) => {
    const { email, password, contactNumber, fullName, role, isSeller } = req.body;

    try {
        const existingUser = await userModel.findOne({
            $or: [
                { email: email.toLowerCase() },
                { contactNumber }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or contact number already exists' });
        }

        const newUser = await userModel.create({
            email: email.toLowerCase(),
            password,
            contactNumber,
            fullName,
            role: (isSeller || role === 'seller') ? 'seller' : 'buyer',
        });

        await sendTokenResponse(newUser, res, 'User registered successfully');
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { identifier, email, password } = req.body;
    const loginIdentifier = (identifier || email || '').trim();

    try {
        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: 'Please provide email/username and password' });
        }

        // Search user by email or contactNumber
        const user = await userModel.findOne({
            $or: [
                { email: loginIdentifier.toLowerCase() },
                { contactNumber: loginIdentifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }

        await sendTokenResponse(user, res, 'Welcome back to Snitch!');
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                contactNumber: req.user.contactNumber,
                fullName: req.user.fullName,
                role: req.user.role,
                isSeller: req.user.role === 'seller',
                avatar: req.user.avatar,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};

export const handleGoogleAuth = async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
            return done(new Error('No email found in Google account profile'), null);
        }

        let user = await userModel.findOne({
            $or: [
                { googleId: profile.id },
                { email: email }
            ]
        });

        if (!user) {
            user = await userModel.create({
                googleId: profile.id,
                fullName: profile.displayName || `${profile.name?.givenName || 'Snitch'} ${profile.name?.familyName || 'Member'}`,
                email: email,
                avatar: profile.photos?.[0]?.value || '',
                role: 'buyer',
            });
        } else {
            if (!user.googleId) {
                user.googleId = profile.id;
            }
            if (profile.photos?.[0]?.value && !user.avatar) {
                user.avatar = profile.photos[0].value;
            }
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
};

export const googleCallback = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.redirect('http://localhost:5173/login?error=Google_auth_failed');
        }

        const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect('http://localhost:5173/login?google_auth=success');
    } catch (error) {
        res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message || 'Google authentication error')}`);
    }
};