const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String, required: true },
    topics: { type: [String], default: [] },
    isSubscribed: { type: Boolean, default: false },
    goodNewsOnly: { type: Boolean, default: false },
    hasReceivedWelcomeEmail: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    scheduleType: { type: String, enum: ['every12', 'custom'], default: 'every12' },
    customScheduleTimes: { type: [String], default: [] }, // Stores hours as ["08", "18"]
    lastDigestSentAt: { type: Date } // For rate limiting "Send Now"
});

module.exports = mongoose.model('User', UserSchema);