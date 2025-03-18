const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        trim: true,
        lowercase: false,
        unique: true,
    },
    createdBy: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: false,
        ref: 'user'
    },
    groupBio: {
        type: String,
        required: false,
        trim: true,
    },
    groupCode: {
        type: Number,
        required: false,
        trim: true,
    },
    
    members: [
        {
            userEmail: { type: String },
            role: { type: String, enum: ['admin', 'reader', 'lender'], default: 'member' },
            username: { type: String },
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const group = mongoose.model('group', groupSchema)

module.exports = group;