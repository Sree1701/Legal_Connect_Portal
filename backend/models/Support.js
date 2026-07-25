const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject line'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please provide your message detail']
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Support', supportSchema);
