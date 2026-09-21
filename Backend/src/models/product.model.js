import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    price: {
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'INR',
        },
    },
    category: {
        type: String,
        default: 'Shirts',
        trim: true,
    },
    stock: {
        type: Number,
        default: 50,
    },
    sizeStock: {
        S: { type: Number, default: 10 },
        M: { type: Number, default: 15 },
        L: { type: Number, default: 12 },
        XL: { type: Number, default: 8 },
        XXL: { type: Number, default: 5 },
    },
    status: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Archived'],
        default: 'In Stock',
    },
    colors: [{
        type: String,
        trim: true,
    }],
    type: {
        type: String,
        trim: true,
        default: '',
    },
    buildSummary: {
        type: String,
        trim: true,
        default: '',
    },
    images: [{
        url: {
            type: String,
            required: true,
        },
        alt: {
            type: String,
            default: '',
        },
    }],
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
        },
        comment: {
            type: String,
            default: '',
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const productModel = mongoose.model('product', productSchema);

export default productModel;
