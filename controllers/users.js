const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { sendError, Unauthorized } = require('../utils/errors')

// Model
const User = require('../models/user')

// * Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { password, confirmPassword, username } = req.body
    // Checked the passwords match
    if (password !== confirmPassword) {
      throw new Unauthorized('Passwords do not match')
    }

    // Hash password
    req.body.hashedPassword = bcrypt.hashSync(password, 12)

    // Create the user
    const user = await User.create(req.body)
    console.log(user)

    // Generate a JWT to send to the client
    const payload = {
      username: user.username,
      _id: user._id
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    })
    
    return res.status(201).json({ user: payload, token })

  } catch (error) {
    sendError(error, res)
  }
})

// * Sign In
router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body
    
    // Checking the username exists in the database
    const user = await User.findOne({ username })
    
    // Check user exists
    if (!user) {
      throw new Unauthorized('Attempt failed as user was not found')
    }

    // Compare plain text password against the hash
    if(!bcrypt.compareSync(password, user.hashedPassword)) {
      throw new Unauthorized('Attempt failed as password was not correct')
    }

    // Generate our JWT
    const payload = {
      username: user.username,
      _id: user._id
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    })

    // Send the JWT back to the client
    return res.json({ user: payload, token })
  } catch (error) {
    sendError(error, res)
  }
})

module.exports = router