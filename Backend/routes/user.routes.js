const express = require('express')
const router = express.Router()
const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const authMiddleware = require('../middleware/authMiddleware')
const jwt = require('jsonwebtoken')
// Importing the multer config
const upload = require("../config/multerConfig")

const JWT_SECRET = process.env.JWT_SECRET;

router.get("/auth/check", (req, res) => {
    const token = req.cookies.token;
    console.log(token)

    if (!token) {
        return res.json({ isAuthenticated: false, user: null });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        res.json({ isAuthenticated: true, user: verified });
    } catch (error) {
        res.json({ isAuthenticated: false, user: null });
    }
});

router.post('/check-existence', async(req, res) => {
    const {email} = req.body;

    const checkExisting = await userModel.findOne({
        email
    })

    if (checkExisting) {
        return res.status(409).json({
            status: 'failed',
            type: 'danger',
            message: "User Already Exists. Please Log In!"
        })
    } else {
        return res.status(200).json({
            status: 'passed'
        })
    }
})

router.post('/view', async(req, res) => {
    const {email} = req.body;

    const userData = await userModel.findOne(
        { email },
        { password: 0 } 
    );

    if (userData) {
        return res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Fetched!",
            data: userData
        })
    } else {
        return res.status(200).json({
            status: 'failed',
            type: 'danger',
            message: "Unable to Fetch!",
        })
    }
})

router.post('/signup', async (req, res) => {
    const {username, email, password} = req.body;
    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = await userModel.create({
        email,
        username,
        password: hashPassword,
        contact: '',
        bio: '',
        urlFront: 'uploads\\mug-front-default',
        urlSide: 'uploads\\mug-side-default',
    })
    

    if (newUser) {
        // Create the JWT Token
        const token = jwt.sign({ userId: newUser._id, email: newUser.email, username: newUser.username }, JWT_SECRET, {
            expiresIn: "24h", // Token expires in 24 hour
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, 
            path: "/",
        });



        res.status(201).json({
            status: 'passed',
            type: 'success',
            message: "User Created!",
            token: token, 
            data: newUser
        })
    } else {
        res.status(200).json({
            status: 'failed',
            type: 'danger',
            message: "User Not Created!"
        })
    }
})

router.post("/upload/mug/front", authMiddleware, upload.single("file"), async (req, res) => {
    if(!req.file) {
        return res.status(400).json({
            status: 'failed',
            type: 'danger',
            message: "No file uploaded!"
        })
    }

    // console.log("Uploaded File Name:", req.file.originalname); // Original name
    // console.log("Stored File Name:", req.file.filename); // Stored name
    console.log("File Path:", req.file.path); // Full path of uploaded file
    console.log(req.user.email)

    try {
        const addUrl = await userModel.findOneAndUpdate(
            {email: req.user.email},
            {$set: {urlFront: req.file.path }},
            {new: true}
        );

        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Front Image Uploaded!",
            data: addUrl.urlFront
        })
        
    } catch (error) {
        console.log(error)
    }
})
router.post("/upload/mug/side", authMiddleware, upload.single("file"), async (req, res) => {
    if(!req.file) {
        return res.status(400).json({
            status: 'failed',
            type: 'danger',
            message: "No file uploaded!"
        })
    }

    // console.log("Uploaded File Name:", req.file.originalname); // Original name
    // console.log("Stored File Name:", req.file.filename); // Stored name
    console.log("File Path:", req.file.path); // Full path of uploaded file
    console.log(req.user.email)

    try {
        const addUrl = await userModel.findOneAndUpdate(
            {email: req.user.email},
            {$set: {urlSide: req.file.path }},
            {new: true}
        );

        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "Side Image Uploaded!",
            data: addUrl.urlSide
        })
        
    } catch (error) {
        console.log(error)
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email)

        const user = await userModel.findOne({ email });
        if (!user) {
            console.log(user)
            return res.status(400).json({
                status: 'failed',
                type: 'danger',
                message: "User Not Found!",
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: 'failed',
                type: 'danger',
                message: "Invalid Credentials!"
            })
        }

        const token = jwt.sign({ userId: user._id, email: user.email, username: user.username }, JWT_SECRET, {
            expiresIn: "24h",
        });

         res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
            maxAge: 24 * 60 * 60 * 1000, 
            path: "/",
        });

        console.log(token)

        res.status(200).json({
            status: 'passed',
            type: 'success',
            message: "User Logged In!",
            data: user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            type: 'danger',
            message: "Internal Server Error!",
        })
    }
});

router.post('/update', authMiddleware, async (req, res) => {
    try {
        const {updatedFields} = req.body;
        console.log(updatedFields)
    
        const userEmail = req.user.email;
    
        const updatedUser = await userModel.updateOne(
            {email: userEmail},
            {$set: updatedFields}
        )
    
        if(updatedUser.modifiedCount === 0){
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

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    
    return res.json({ 
        message: "Logged out successfully", 
        isAuthenticated: false 
    });
});

module.exports = router
