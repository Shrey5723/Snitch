import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { 
        type: String, 
        required: function() { return !this.googleId; } 
    },
    contactNumber: { 
        type: String, 
        required: function() { return !this.googleId; } 
    },
    fullName: { type: String, required: true, trim: true },
    role: {
        type: String, 
        enum: ['buyer', 'seller'], 
        default: 'buyer'
    },
    googleId: { type: String, default: null },
    avatar: { type: String, default: '' },
}, {
    timestamps: true
});

userSchema.pre('save', async function() {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;