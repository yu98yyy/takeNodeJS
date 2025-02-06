const mongoose = require('mongoose');

const MatchingRequestSchema = new mongoose.Schema({
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 変更
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // 変更
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MatchingRequest', MatchingRequestSchema);
