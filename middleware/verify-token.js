const jwt = require('jsonwebtoken')

// Model
const User = require('../models/user')
const { sendError, Unauthorized } = require('../utils/errors')

const verifyToken = async (req, res, next) => {
  try {
    // 1. Extract the token (if it exists) from the authorization header (don't forget to remove `Bearer `)
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) throw new Unauthorized('Token not present in authorization header')

    // 2. Use jwt.verify() to verify the token provided in the authorization header
    // If the token is valid we will receive the payload as a response to `jwt.verify`
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    // 3. We will use this payload to get the user._id and check our database for that user
    const user = await User.findById(payload._id)

    // 4. If the user does not exist, invalidate the request (by throwing an error)
    if (!user) throw new Unauthorized('User does not exist')

    // 5. If the user exists and the token is valid, make the user available in the controller
    req.user = user

    // 6. the user is authorized, pass the user the controller, run the next() middleware
    next()
  } catch (error) {
    sendError(error, res)
  }
}

module.exports = verifyToken