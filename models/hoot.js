const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'User', 
    required: true
  }
}, {
  timestamps: true
})

const hootSchema = new mongoose.Schema({
  title: { type: String, required: ['Title is required', true] },
  text: { type: String, required: ['Text is required', true] },
  category: { 
    type: String, 
    enum: ['News', 'Sports', 'Games', 'Movies', 'Music', 'Television'],
    required: true 
  },
  author: { 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'User', 
    required: true
  },
  comments: [commentSchema]
}, {
  timestamps: true
})

const Hoot = mongoose.model('Hoot', hootSchema)

module.exports = Hoot