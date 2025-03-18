const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true,
        trim: true,
        lowercase: false,
    },
    bookOwner: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    bookAuthor: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    bookCategory: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    status: {
        type: String,
        required: true,
        trim: true,
        default: 'available'
    },
    lentTo: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
    expectedReturnDate: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
    requests: [
        {
            userEmail: { type: String , required: true },
            suggestedReturnDate: { type: String , required: true}
        },
    ]
})

const book = mongoose.model('book', bookSchema)

module.exports = book;