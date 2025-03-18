const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const groupModel = require('../models/group.model')
const group = require('../models/group.model')
const mongoose = require('mongoose')

router.post('/create', authMiddleware, async (req, res) => {
    const {groupName, groupBio} = req.body

    const checkExisting = await groupModel.findOne({
        groupName
    })

    if (checkExisting) {
        return res.status(409).json({
            status: 'failed',
            type:'danger',
            message: 'Group already exists.'
        })
    }

    // Access the email send from middleware
    const createdBy = req.user.userId;
    const userEmail = req.user.email;
    const username = req.user.username
    console.log(createdBy)
    const groupCode = Math.floor(100000 + Math.random() * 900000); // Six digit random number

    const newGroup = await groupModel.create({
        groupName, createdBy, groupBio, groupCode, members: [{ userEmail: userEmail, role:'admin', username: username}]
    })

    if (newGroup) {
        res.status(201).json({
            status: 'passed',
            type: 'success',
            message: "Group Created!",
        })
    } else {
        res.status(200).json({
            status: 'failed',
            type: 'danger',
            message: "Group Creation Failed!",
        })
    }
})

router.post('/delete', authMiddleware, async (req, res) => {
    const {groupId} = req.body;
    console.log(groupId)

    const groupIdObject = new mongoose.Types.ObjectId(groupId);

    const deleteGroup = await groupModel.findByIdAndDelete(groupIdObject)
    console.log(deleteGroup)

    if (deleteGroup) {
        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Group Deleted!",
        })
    } else {
        res.status(200).json({
            status: 'failed',
            type: 'danger',
            message: "Group Deletion Failed!",
        })
    }
})

router.post('/fetch/one', authMiddleware, async (req, res) => {
    const {groupId} = req.body;
    console.log(groupId)
    const groupIdObject = new mongoose.Types.ObjectId(groupId);

    const singleGroup = await groupModel.findById(groupIdObject)

    if (singleGroup) {
        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Group Fetch Success!",
            data: singleGroup
        })
    } else {
        res.status(200).json({
            status: 'failed',
            type: 'danger',
            message: "Group Fetch Failed!",
        })
    }
})

router.post('/fetch/all', authMiddleware, (req, res) => {
    const allGroups = groupModel.find()

    if (deleteGroup) {
        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Group Fetch Success!",
            data: allGroups
        })
    } else {
        res.status(200).json({
            status: 'failed',
            type: 'danger',
            message: "Group Fetch Failed!",
        })
    }
})

// To get all Joined Groups
router.get('/fetch/joined', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        console.log(userEmail)

        const joinedGroups = await groupModel.find({
            "members.userEmail": userEmail
        }).populate("createdBy");
    
        console.log(joinedGroups);
        

        if (!joinedGroups) {
            return res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Group Fetch Failed!",
            })
        }

        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Group Fetch Success!",
            data: joinedGroups
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error!",
        })
    }
})

router.post('/remover-member', authMiddleware, async (req, res) => {
    try {
        const {groupId, removeEmail} = req.body;
        const groupIdObject = new mongoose.Types.ObjectId(groupId);
        
        console.log(removeEmail)

        const removeMember = await groupModel.findOneAndUpdate(
            {groupIdObject},
            { $pull: { members: { userEmail: removeEmail } } }, 
        )
    
    
        if (!removeMember) {
            return res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Removal Failed!",
            })
        }

        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Removal Success!",
            })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error!",
        })
    }
})

router.get('/fetch/not-joined', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        console.log(userEmail)

        const notJoinedGroups = await groupModel.find({
            "members.userEmail": { $nin: [userEmail] }
        }).populate("createdBy");
    
        console.log(notJoinedGroups);
        

        if (!notJoinedGroups) {
            return res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Group Fetch Failed!",
            })
        }

        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Group Fetch Success!",
            data: notJoinedGroups
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error!",
        })
    }
})

router.post('/join', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email
        const username = req.user.username
        console.log(userEmail)
        const {groupId, groupCode} = req.body
        console.log(groupId, groupCode)
        const groupIdObject = new mongoose.Types.ObjectId(groupId);

        const newMember = {userEmail, role:'reader', username}
        console.log(newMember)
        console.log(parseInt(groupCode))

        const addToGroup = await groupModel.findOneAndUpdate(
            {
                _id: groupIdObject,
                groupCode: parseInt(groupCode)
            },  
            { $push: { members: newMember } }  // Second argument: Update operation
        )

        console.log(addToGroup) 

        if(addToGroup) {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Added to Group!",
            })
        } else {
            res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Failed to Add to Group!",
            })
        }

    } catch (error) {
        console.log(error)
    }
})

router.post('/promote', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email
        console.log(userEmail)
        const {groupId} = req.body
        console.log(groupId)
        const groupIdObject = new mongoose.Types.ObjectId(groupId);

        const promoteToLender = await groupModel.updateOne(
            { 
                _id: groupIdObject,  
                "members.userEmail": userEmail  // Find the document where this user exists in the members array
            },
            { 
                $set: { "members.$.role": "lender" }  // Update the `role` field for the matched user
            },
        )

        console.log(promoteToLender) 

        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Promoted to Lender!",
        })

    } catch (error) {
        console.log(error)
    }
})


router.post('/get-common-groups', authMiddleware, async (req, res) => {
    try {
        const loggedInUser = req.user.email
        console.log(loggedInUser)
        const {requestedUser} = req.body
        console.log(requestedUser)

        const commonGroups = await groupModel.find({
            $and: [
                {"members.userEmail": loggedInUser},
                {"members.userEmail": requestedUser},
            ]
        })

        console.log(commonGroups) 

        if(commonGroups) {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Common Groups Fetched Successfully!",
                data: commonGroups
            })
        } else {
            res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Common Groups Fetch Failed!",
            })
        }

    } catch (error) {
        console.log(error)
    }
})
router.post('/revert', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email
        console.log(userEmail)
        const {groupId} = req.body
        console.log(groupId)
        const groupIdObject = new mongoose.Types.ObjectId(groupId);

        const promoteToLender = await groupModel.updateOne(
            { 
                _id: groupIdObject,  
                "members.userEmail": userEmail  // Find the document where this user exists in the members array
            },
            { 
                $set: { "members.$.role": "reader" }  // Update the `role` field for the matched user
            },
        )

        console.log(promoteToLender) 

        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Reverted to Reader!",
        })

    } catch (error) {
        console.log(error)
    }
})

router.post('/update', authMiddleware, async (req, res) => {
    try {
        const {groupId, updatedFields} = req.body;
        console.log(updatedFields)
    
        // Validate groupId
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid groupId" });
        }
    
        const updatedGroup = await groupModel.updateOne(
            {_id: groupId},
            {$set: updatedFields}
        )
    
        if(updatedGroup.modifiedCount === 0){
            return res.status(404).json({
                status: 'failed',
                type: 'danger',
                message: "Modification Failed!"
            })
        }
    
        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Modified Successfully!"
        }) 
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error! "
        }) 
    }
})

module.exports = router