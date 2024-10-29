const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan')
const cors = require('cors')
const verifyToken = require('./middleware/verify-token')

// Routers/Controllers
const usersRouter = require('./controllers/users')
const hootsRouter = require('./controllers/hoots')

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// ! Middleware
app.use(cors({ origin: 'http://localhost:5173' })) // allow cross-domain requests from our React App
app.use(express.json()) // convert JSON body to JS on req.body
app.use(morgan('dev'))

// ! Routes go here
app.use('/users', usersRouter)
app.use('/hoots', hootsRouter)

// Example of an authenticated route
app.get('/secure-path', verifyToken, async (req, res) => {
  console.log('User available in controller:', req.user)
  return res.json({ message: 'You accessed the secure path' })
})

app.listen(3000, () => {
  console.log('The express app is ready!');
});