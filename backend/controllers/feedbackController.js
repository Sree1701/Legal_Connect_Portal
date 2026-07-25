const Feedback = require('../models/Feedback');

/**
 * @desc    Submit user feedback
 * @route   POST /api/feedback
 * @access  Private (Citizen/Advocate/Admin)
 */
const submitFeedback = async (req, res, next) => {
  const { rating, comments } = req.body;

  try {
    if (!rating || !comments) {
      return res.status(400).json({ success: false, message: 'Please provide both rating and comments' });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      rating,
      comments
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback!',
      feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all user feedback (Admin only)
 * @route   GET /api/feedback
 * @access  Private (Admin)
 */
const getFeedbacks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Feedback.countDocuments();
    const feedbacks = await Feedback.find()
      .populate('user', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      feedbacks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getFeedbacks
};
