const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

// Model
const Hoot = require('../models/hoot')
const verifyToken = require('../middleware/verify-token')

const { sendError, NotFound, Forbidden } = require('../utils/errors')

// Routes

// * Create
// verifyToken is ensuring user is authenticated
router.post('', verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id
    const hoot = await Hoot.create(req.body)
    hoot._doc.author = req.user
    return res.status(201).json(hoot)
  } catch (error) {
    sendError(error, res)
  }
})

// * Index
router.get('', verifyToken, async (req, res) => {
  try {
    const hoots = await Hoot.find()
      .populate('author')
      .sort({ createdAt: 'desc' })
    return res.json(hoots)
  } catch (error) {
    sendError(error, res)
  }
})

// * Show
router.get('/:hootId', verifyToken, async (req, res) => {
  try {
    const { hootId } = req.params 

    // Search for the single hoot
    const hoot = await Hoot.findById(hootId).populate(['author', 'comments.author'])

    // If no hoot found, send 404
    if (!hoot) throw new NotFound('Hoot not found.')

    // If hoot is found, send it to the client 
    return res.json(hoot)
  } catch (error) {
    sendError(error, res)
  }
})

// * Update
router.put('/:hootId', verifyToken, async (req, res) => {
  try {
    const { hootId } = req.params

    // Search for the hoot
    const hoot = await Hoot.findById(hootId)

    // Send 404 if not found
    if (!hoot) throw new NotFound('Hoot not found.')

    // Check author of hoot is the same user as req.user
    if(!hoot.author.equals(req.user._id)) {
      throw new Forbidden('Request user does not match author id')
    }

    // Make the update to the hoot object
    Object.assign(hoot, req.body)

    // Save changes
    await hoot.save()

    // OPTIONAL: Populate the author
    hoot._doc.author = req.user

    // Return the updated hoot document
    return res.json(hoot)
  } catch (error) {
    sendError(error, res)
  }
})

// * Delete route
router.delete('/:hootId', verifyToken, async (req, res) => {
  try {
    const { hootId } = req.params

    // Search for the hoot
    const hoot = await Hoot.findById(hootId)

    // Send 404 if not found
    if (!hoot) throw new NotFound('Hoot not found.')

    // Check author of hoot is the same user as req.user
    if(!hoot.author.equals(req.user._id)) {
      throw new Forbidden('Request user does not match author id')
    }

    // Delete hoot
    const deletedHoot = await Hoot.findByIdAndDelete(hootId)

    // Return deleted hoot
    return res.json(deletedHoot)
  } catch (error) {
    sendError(error, res)
  }
})


// ! Comment Routes

// * Create
router.post('/:hootId/comments', verifyToken, async (req, res) => {
  try {
    const { hootId } = req.params

    // Search for the hoot containing the comment
    const hoot = await Hoot.findById(hootId)

    // If hoot not found, send 404
    if (!hoot) throw new NotFound('Hoot not found.')

    // Add the author field to the comment
    req.body.author = req.user._id

    // Add comment to comments array
    hoot.comments.push(req.body)

    // Save the hoot to persist this to the db
    await hoot.save()

    // Target the newly added comment
    const addedComment = hoot.comments[hoot.comments.length - 1]

    // Populate author on the comment
    addedComment._doc.author = req.user

    // Send the added comment to the client
    return res.status(201).json(addedComment)
  } catch (error) {
    sendError(error, res)
  }
})

module.exports = router