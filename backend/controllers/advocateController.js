const Complaint = require('../models/Complaint');
const { createNotification } = require('../services/notificationService');
const User = require('../models/User');

/**
 * @desc    Get all consultation requests for advocates
 * @route   GET /api/advocate/complaints
 * @access  Private (Advocate)
 */
const getAdvocateComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter type: 'all' (all pending cases), 'my_responses' (cases where advocate replied)
    if (req.query.filter === 'my_responses') {
      query['advocateReplies.advocate'] = req.user.id;
    } else {
      // Default: show pending or under-review cases
      query.status = { $in: ['pending', 'under_review'] };
    }

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('citizen', 'username email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: complaints.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      complaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add official advocate reply to citizen case
 * @route   POST /api/advocate/complaints/:id/reply
 * @access  Private (Advocate)
 */
const replyToComplaint = async (req, res, next) => {
  const { message, status, includeVideoCall, consultationFee } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please enter a response message' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    let videoMeetingUrl = '';
    if (includeVideoCall) {
      const cleanTitle = complaint.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
      videoMeetingUrl = `https://meet.jit.si/LegalAssist-Consultation-${cleanTitle}-${complaint._id}`;
    }

    // Add reply
    complaint.advocateReplies.push({
      advocate: req.user.id,
      message,
      replyDate: new Date(),
      videoMeetingUrl,
      consultationFee: consultationFee ? Number(consultationFee) : 500
    });

    // Update status if provided, else transition to 'under_review'
    if (status && ['under_review', 'resolved'].includes(status)) {
      complaint.status = status;
    } else {
      complaint.status = 'under_review';
    }

    await complaint.save();

    // Create Notification for the citizen
    await createNotification(
      complaint.citizen,
      `Advocate ${req.user.username} has provided legal guidance on your case: "${complaint.title}".`,
      'reply'
    );

    res.status(200).json({
      success: true,
      message: 'Guidance response submitted successfully',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get advocate's availability slots
 * @route   GET /api/advocate/availability
 * @access  Private (Advocate)
 */
const getAvailability = async (req, res, next) => {
  try {
    const advocate = await User.findById(req.user.id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate not found' });
    }

    // Sort slots by time
    const slots = advocate.availabilitySlots.sort((a, b) => new Date(a.time) - new Date(b.time));

    res.status(200).json({ success: true, slots });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add availability slot
 * @route   POST /api/advocate/availability
 * @access  Private (Advocate)
 */
const addAvailability = async (req, res, next) => {
  const { time } = req.body;
  try {
    if (!time) {
      return res.status(400).json({ success: false, message: 'Please provide slot date/time' });
    }

    const slotTime = new Date(time);
    if (slotTime < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot add slot in the past' });
    }

    const advocate = await User.findById(req.user.id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate not found' });
    }

    // Check if slot already exists within a 30-minute window to prevent overlaps
    const overlap = advocate.availabilitySlots.find(s => {
      const existingTime = new Date(s.time).getTime();
      const diff = Math.abs(existingTime - slotTime.getTime());
      return diff < 30 * 60 * 1000; // Less than 30 minutes difference
    });

    if (overlap) {
      return res.status(400).json({ success: false, message: 'This slot conflicts with an existing slot (must be at least 30 mins apart).' });
    }

    advocate.availabilitySlots.push({ time: slotTime });
    await advocate.save();

    // Sort slots by time
    const slots = advocate.availabilitySlots.sort((a, b) => new Date(a.time) - new Date(b.time));

    res.status(201).json({ success: true, message: 'Availability slot added successfully', slots });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete availability slot
 * @route   DELETE /api/advocate/availability/:slotId
 * @access  Private (Advocate)
 */
const deleteAvailability = async (req, res, next) => {
  try {
    const advocate = await User.findById(req.user.id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate not found' });
    }

    const slot = advocate.availabilitySlots.id(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ success: false, message: 'Cannot delete a slot that is already booked' });
    }

    advocate.availabilitySlots.pull({ _id: req.params.slotId });
    await advocate.save();

    // Sort slots
    const slots = advocate.availabilitySlots.sort((a, b) => new Date(a.time) - new Date(b.time));

    res.status(200).json({ success: true, message: 'Availability slot removed successfully', slots });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdvocateComplaints,
  replyToComplaint,
  getAvailability,
  addAvailability,
  deleteAvailability
};
