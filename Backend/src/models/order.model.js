import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    size: {
        type: String,
        default: 'M'
    },
    color: {
        type: String,
        default: 'Black'
    },
    image: {
        type: String,
        default: ''
    }
}, { _id: true });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' }
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Confirmed'
    }
}, {
    timestamps: true
});

const orderModel = mongoose.model('order', orderSchema);

export default orderModel;
