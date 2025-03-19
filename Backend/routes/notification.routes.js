const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const notificationModel = require('../models/notification.model')
const mongoose = require('mongoose')

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const {forUser, message, fromUser} = req.body

    const newNotification = await notificationModel.create({
        fromUser, forUser, message
    })

    if (newNotification) {
        res.status(201).json({
            status: 'passed',
            type: 'success',
            message: "Notification Sent!",
        })
    } else {
        res.status(200).json({
            status: 'failed',
            type: 'danger',
            message: "Notification Sending Failed!",
        })
    }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error!",
        })
    }
})

router.post('/delete', authMiddleware, async (req, res) => {
    try {
        const {notificationId} = req.body
        const notificationIdObject = new mongoose.Types.ObjectId(notificationId);

        const deleteNotification = await notificationModel.findByIdAndDelete(notificationIdObject)

        if (deleteNotification) {
            res.status(201).json({
                status: 'passed',
                type: 'success',
                message: "Notification Deleted!",
            })
        } else {
            res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Notification Delete Failed!",
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error!",
        })
    }
})

router.get('/fetch', authMiddleware, async (req, res) => {
    try {
        const forUser = req.user.email

        const allNotifications = await notificationModel.find({
            forUser: forUser
        })

        if (allNotifications) {
            res.status(201).json({
                status: 'passed',
                type: 'success',
                message: "Notification Fetched!",
                data: allNotifications
            })
        } else {
            res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Notification Fetch Failed!",
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error!",
        })
    }
})

module.exports = router