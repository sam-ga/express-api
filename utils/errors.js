// * Custom Error Classes
class Unauthorized extends Error {
  constructor(message){
    super(message)
    this.name = 'Unauthorized'
  }
}

class Forbidden extends Error {
  constructor(message){
    super(message)
    this.name = 'Forbidden'
  }
}

class NotFound extends Error {
  constructor(message){
    super(message)
    this.name = 'NotFound'
  }
}

const logErrors = (error) => {
  console.log('\n****************\n')
  console.log('🚨 ERROR 🚨')
  console.log('\n****************\n')
  console.log('Type:\n')
  console.log(error.name)
  console.log('\n****************\n')
  console.log('Details:\n')
  console.log(error.errors ? JSON.parse(JSON.stringify(error.errors)) : error.message)
  console.log('\n****************\n')
  console.log('This error was thrown during the below request 👇\n')
}


// * Function that sends error responses to the client

const sendError = (error, res) => {
  // * Log errors to console
  logErrors(error)

  // * Unique Constraint
  // This happens when the client attempts to create a duplicate entry for a unique field
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const [fieldName, fieldValue] = Object.entries(error.keyValue)[0]
    return res.status(400).json({ [fieldName]: `${fieldName} "${fieldValue}" already taken. Please try another.` })
  }
  

  // * ValidationError
  // This happens when field errors occur (like required constraint or incorrect type)
  if (error.name === 'ValidationError') {
    return res.status(422).json(error.errors)
  }

  // * CastError
  // This error is thrown when Mongoose fails to cast a string to an ObjectId
  if (error.name === 'CastError') {
    return res.status(400).json({ errorMessage: error.message })
  }

  // * Unauthorized
  // This error is thrown when the user fails to identify themselves
  if (error.name === 'Unauthorized') {
    return res.status(401).json({ errorMessage: 'Unauthorized' })
  }

  // * Forbidden
  // This error is thrown when an authenticated user is denied access to an authorized resource
  if (error.name === 'Forbidden') {
    return res.status(403).json({ errorMessage: 'You are not authorized to access that resource' })
  }

  // * NotFound
  // This error occurs when a resource could not be located
  if (error.name === 'NotFound') {
    return res.status(404).json({ errorMessage: error.message })
  }

  // * Generic Server Error
  // This is for every unknown error that is thrown, that is not in the list above
  return res.status(500).json({ errorMessage: 'An unknown error occurred.' })
}

module.exports = {
  sendError,
  Unauthorized,
  Forbidden,
  NotFound
}