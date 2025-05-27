import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const supervisorSchema = new mongoose.Schema({
    Username: {
        type: String,
        required: true,
        trim: true
    },
    UserID: {
        type: Number,
        required: true,
        default: () => Math.floor(100000 + Math.random() * 900000), // Auto-generates 6-digit number
        unique: true
    },
    supervisorId: {
        type: Number,
        required: true,
        default: () => Math.floor(100000 + Math.random() * 900000), // Auto-generates 6-digit number
        unique: true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    Password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function(v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(v);
            },
            message: 'Password must include uppercase, lowercase, number, and special character'
        }
    },
    resetToken: {
        type: String,
        default: undefined
    },
    resetTokenExpiry: {
        type: Date,
        default: undefined
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
supervisorSchema.pre('save', async function(next) {
    if (!this.isModified('Password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.Password = await bcrypt.hash(this.Password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
supervisorSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.Password);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

const Supervisor = mongoose.model('Supervisor', supervisorSchema);

export default Supervisor; 