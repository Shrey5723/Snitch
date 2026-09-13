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
}, {
    timestamps: true,
});

const productModel = mongoose.model('product', productSchema);

export default productModel;
