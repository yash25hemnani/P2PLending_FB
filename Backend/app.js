const express = require('express')
const app = express();

const dotenv = require('dotenv')
dotenv.config()

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cors = require('cors');
app.use(
  cors({
    origin: "https://p2p-lending-frontend.onrender.com", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  })
);

const morgan = require('morgan')
const userRouter = require('./routes/user.routes')
const groupRouter = require('./routes/group.routes')
const bookRouter = require('./routes/book.routes')
const notificationRouter = require('./routes/notification.routes')

const connectToDB = require('./config/db')
connectToDB()

app.use('/uploads', express.static('uploads'));

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))



app.get('/', (req, res) => {
    res.send("Hello world")
})

app.use('/user', userRouter)
app.use('/group', groupRouter)
app.use('/book', bookRouter)
app.use('/notification', notificationRouter)

const port = process.env.PORT || 3000

app.listen(port, () => console.log('Server running on port 3000'));
