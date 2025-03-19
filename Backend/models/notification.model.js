const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    fromUser: {
        type: String,
        required: true,
    },
    forUser: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
})

const notification = mongoose.model('notification', notificationSchema)

module.exports = notification;