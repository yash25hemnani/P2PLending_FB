const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: false,
        unique: false,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    contact: {
        type: String,
        required: false,
        trim: true,
    },
    bio: {
        type: String,
        required: false,
        trim: true,
    },
    urlFront: {
        type: String,
        required: false,
        trim: true,
        default: 'uploads\\mug-front-default'
    },
    urlSide: {
        type: String,
        required: false,
        trim: true,
        default: 'uploads\\mug-side-default'
    },
})

const user = mongoose.model('user', userSchema)

module.exports = user;