const mongoose = require('mongoose');

const advocateReviewSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  advocate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: [true, 'Please write a review message']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a citizen can review a specific advocate only once
advocateReviewSchema.index({ citizen: 1, advocate: 1 }, { unique: true });

module.exports = mongoose.model('AdvocateReview', advocateReviewSchema);
