const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true }
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
      delete returnedObject.hashedPassword
  }
})

// Create and export model
const User = mongoose.model('User', userSchema)
module.exports = User