const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const serverless = require('serverless-http')
const cors = require('cors')

// Routers/Controllers
const usersRouter = require('../../controllers/users')
const hootsRouter = require('../../controllers/hoots')

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

// ! Middleware
app.use(cors({ origin: process.env.FRONT_END_URL })) // allow cross-domain requests from our React App
app.use(express.json()) // convert JSON body to JS on req.body
app.use(morgan('dev'))

// ! Routes go here
app.use('/users', usersRouter)
app.use('/hoots', hootsRouter)


module.exports.handler = serverless(app)