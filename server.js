const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')
const colors = require('colors')
const fileupload = require('express-fileupload')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error')


//Load env vars
dotenv.config({ path : './config/config.env' })

//Connect to database
connectDB()


//Route Files
const bootcamps = require('./routes/bootcamp')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')

const app = express();

//Body parser
app.use(express.json())

//Cookie parser
app.use(cookieParser())

//Dev logging Middleware

if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
// File uploading
app.use(fileupload())

//Sanitize data
app.use(mongoSanitize())

//Set Security Headers
app.use(helmet())

//Prevent XSS attacks
app.use(xss())

//Rate limiting

const limiter = rateLimit({
    windowMs : 10*60*1000, //10mins
    max:100
})
app.use(limiter)

// Prevent hpp params pollution

app.use(hpp())

// Enable cors
app.use(cors())


//Set static folder
app.use(express.static(path.join(__dirname,'public')))

//Mount routers
app.use('/api/v1/bootcamps',bootcamps)
app.use('/api/v1/courses',courses)
app.use('/api/v1/auth',auth)
app.use('/api/v1/users',users)
app.use('/api/v1/reviews',reviews)


app.use(errorHandler)

const PORT = process.env.PORT || 5000;

console.log(process.env.NODE_ENV)
const server = app.listen(PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.red.bold))



//Handle unhandled promise rejections
// process.on('unhandledRejection',(err,promise)=>{
//     console.log(`Error:${err.message} right here`.red)
//     promise.then((data)=>{
//         console.log(data)
//     })
//         .catch((reason)=>{
//         console.log(reason)
//     })
//     //Close server & exit process
//     server.close(()=> process.exit(1))
// })

