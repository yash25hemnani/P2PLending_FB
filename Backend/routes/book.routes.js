const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const bookModel = require('../models/book.model')
const mongoose = require('mongoose')

router.post('/create', authMiddleware, async (req, res) => {
    const {bookName, bookAuthor, bookCategory} = req.body
    const bookOwner = req.user.email

    const checkExisting = await bookModel.findOne({
        bookName,
        bookOwner: bookOwner
    })

    if (checkExisting) {
        return res.status(409).json({
            status: 'failed',
            type:'danger',
            message: 'Book already exists.'
        })
    }

    const newBook = await bookModel.create({
        bookName, bookOwner, bookAuthor, bookCategory
    })

    if (newBook) {
        res.status(201).json({
            status: 'passed',
            type: 'success',
            message: "Book Created!",
            book: newBook
        })
    } else {
        res.status(200).json({
            status: 'failed',
            type: 'danger',
            message: "Book Creation Failed!",
        })
    }
})

router.post('/delete', authMiddleware, async (req, res) => {
    const {bookId} = req.body;

    const bookIdObject = new mongoose.Types.ObjectId(bookId);

    const deleteBook = await bookModel.findByIdAndDelete(bookIdObject)

    if (deleteBook) {
        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Book Deleted!",
        })
    } else {
        res.status(200).json({
            status: 'failed',
            type: 'danger',
            message: "Book Deletion Failed!",
        })
    }
})

router.get('/fetch/all', authMiddleware, async (req, res) => {
    try {
        const bookOwner = req.user.email

        const allBooks = await bookModel.find({ bookOwner });

        if (allBooks) {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Book Fetch Success!",
                data: allBooks
            })
        } else {
            res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Book Fetch Failed!",
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error! "
        }) 
    }
})

router.post('/fetch/all/viewing', authMiddleware, async (req, res) => {
    try {
        const {bookOwner} = req.body

        const allBooks = await bookModel.find({ bookOwner });

        if (allBooks) {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Book Fetch Success!",
                data: allBooks
            })
        } else {
            res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Book Fetch Failed!",
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error! "
        }) 
    }
})

router.get('/fetch/borrowed', authMiddleware, async (req, res) => {
    try {
        const borrower = req.user.email

        const borrowedBooks = await bookModel.find({ 
            lentTo: borrower
         });

        if (borrowedBooks) {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Book Fetch Success!",
                data: borrowedBooks
            })
        } else {
            res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Book Fetch Failed!",
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error! "
        }) 
    }
})

router.post('/fetch/borrowed/viewing', authMiddleware, async (req, res) => {
    try {
        const {borrower} = req.body

        const borrowedBooks = await bookModel.find({ 
            lentTo: borrower
         });

        if (borrowedBooks) {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Book Fetch Success!",
                data: borrowedBooks
            })
        } else {
            res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Book Fetch Failed!",
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error! "
        }) 
    }
})



router.post('/update', authMiddleware, async (req, res) => {
    try {
        const {bookId, updatedFields} = req.body;
        console.log(updatedFields)
    
        // Validate groupId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: "Invalid groupId" });
        }

        const bookIdObject = new mongoose.Types.ObjectId(bookId);
    
        const updatedBook = await bookModel.updateOne(
            {_id: bookIdObject},
            {$set: updatedFields}
        )
    
        if(updatedBook.modifiedCount === 0){
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

router.post('/change/date', authMiddleware, async (req, res) => {
    try {
        const {bookId, newDate} = req.body
        const groupIdObject = new mongoose.Types.ObjectId(bookId);
        const userEmail = req.user.email

        const changeDate = await bookId.updateOne(
            { 
                _id: bookIdObject,  
                "requests.userEmail": userEmail  // Find the document where this user exists in the members array
            },
            { 
                $set: { "requests.$.suggestedReturnDate":  newDate }  // Update the `role` field for the matched user
            },
        )


        if(changeDate.modifiedCount === 0){
            return res.status(404).json({
                status: 'failed',
                type: 'danger',
                message: "Updation Failed!"
            })
        }
    
        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Updated Successfully!"
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

router.post('/request', authMiddleware, async (req, res) => {
    try {
        const {bookId, suggestedReturnDate} = req.body;
        const userEmail = req.user.email

        const bookIdObject = new mongoose.Types.ObjectId(bookId);
        console.log(bookIdObject)

        const newRequest = { 
            userEmail: userEmail, 
            suggestedReturnDate: suggestedReturnDate 
        };

        console.log(newRequest)

        const addBookRequest = await bookModel.findByIdAndUpdate(
            bookIdObject,  
            { $push: { requests: newRequest } },  // Second argument: Update operation
        )

        console.log(addBookRequest)

        if (addBookRequest) {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Requested Successfully!"
            }) 
        }
    

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error! "
        }) 
    }
})

router.post('/shelve', authMiddleware, async (req, res) => {
    try {
        const {bookId} = req.body;

        // Validate groupId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: "Invalid groupId" });
        }

        const bookIdObject = new mongoose.Types.ObjectId(bookId);
    
        const updatedBook = await bookModel.updateOne(
            {_id: bookIdObject},
            {$set: {
                status: 'available',
                lentTo: '',
                expectedReturnDate: '',
                requests: []
            }}
        )
    
        if(updatedBook.modifiedCount === 0){
            return res.status(404).json({
                status: 'failed',
                type: 'danger',
                message: "Request Failed!"
            })
        }
    
        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Book Receieved!"
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

router.get('/request/received', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email
        console.log(userEmail)

        // Logic - The owner is the logged in user, and has received some requests, i.e. the requests array is not empty.
        const receivedBookRequests = await bookModel.find({
            bookOwner: userEmail,
            "requests": { $exists: true, $ne: [] }
        })

        console.log(receivedBookRequests)
        if(receivedBookRequests) {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Fetched Successfully!",
                data: receivedBookRequests
            }) 
        } else {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Fetch Failed!"
            }) 
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error! "
        }) 
    }
})

router.get('/request/sent', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email

        // Logic - The owner is the logged in user, and has received some requests, i.e. the requests array is not empty.
        const sentBookRequests = await bookModel.find({
            bookOwner: { $ne: userEmail },
            "requests.userEmail": { $in: [userEmail] }
        })

        console.log(sentBookRequests)
        if(sentBookRequests) {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Fetched Successfully!",
                data: sentBookRequests
            }) 
        } else {
            res.status(200).json({
                status: 'passed',
                type: 'success',
                message: "Fetch Failed!"
            }) 
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error! "
        }) 
    }
})

router.post('/request/approve', authMiddleware, async (req, res) => {
    try {
        const {bookId, userEmail, expectedReturnDate} = req.body;

        // Validate groupId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: "Invalid groupId" });
        }

        const bookIdObject = new mongoose.Types.ObjectId(bookId);
    
        const updatedBook = await bookModel.updateOne(
            {_id: bookIdObject},
            {$set: {
                status: 'lent',
                lentTo: userEmail,
                expectedReturnDate: expectedReturnDate,
                requests: []
            }}
        )
    
        if(updatedBook.modifiedCount === 0){
            return res.status(404).json({
                status: 'failed',
                type: 'danger',
                message: "Request Failed!"
            })
        }
    
        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Request Approved!"
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

router.post('/request/remove', authMiddleware, async (req, res) => {
    try {
        const {bookId, userEmail} = req.body;

        // Validate groupId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: "Invalid groupId" });
        }

        const bookIdObject = new mongoose.Types.ObjectId(bookId);
    
        const updatedBook = await bookModel.updateOne(
            { 
                _id: bookIdObject,  
            },
            { 
                $pull: { requests: { userEmail: userEmail } }  // Remove object with matching userEmail
            }
        )
    
        if(updatedBook.modifiedCount === 0){
            return res.status(200).json({
                status: 'failed',
                type: 'danger',
                message: "Removal Failed!"
            })
        }
    
        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Removed Successfully!"
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