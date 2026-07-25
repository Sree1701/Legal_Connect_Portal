const Complaint = require('../models/Complaint');
const { createNotification } = require('../services/notificationService');
const User = require('../models/User');
const geminiService = require('../services/geminiService');
const pdfService = require('../services/pdfService');

/**
 * @desc    Submit a new complaint
 * @route   POST /api/complaints
 * @access  Private (Citizen)
 */
const submitComplaint = async (req, res, next) => {
  const { title, description, incidentDate, state, district, category } = req.body;

  try {
    if (!title || !description || !incidentDate || !state || !district) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // Process uploaded documents
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        documents.push({
          name: file.originalname,
          url: `/uploads/${file.filename}`,
          filename: file.filename
        });
      });
    }

    // Initialize temporary schema structure while AI loads
    const initialAIResponse = {
      summary: "Analyzing case...",
      classification: category || "General",
      applicableLaws: [],
      suggestedAuthority: "Identifying suitable forum...",
      requiredDocuments: [],
      stepByStepProcedure: [],
      nextActions: [],
      preventiveTips: [],
      faqs: [],
      disclaimer: "This platform provides informational guidance only and is not a substitute for professional legal advice or court decisions."
    };

    // Create the complaint in database first (so we have an ID)
    let complaint = await Complaint.create({
      citizen: req.user.id,
      title,
      description,
      incidentDate,
      state,
      district,
      category: category || 'General',
      documents,
      status: 'pending',
      aiResponse: initialAIResponse
    });

    // Run Gemini AI guidance in background or synchronously.
    // To give a smooth user experience, we can await it here, or run it async.
    // The request wants complete output with loading states, so let's run it synchronously
    // to populate the DB immediately before responding, ensuring reliable state.
    const aiGuidanceResult = await geminiService.generateLegalGuidance(
      title,
      description,
      category,
      state,
      district
    );

    complaint.aiResponse = aiGuidanceResult;
    await complaint.save();

    // Create Notification for the citizen
    await createNotification(
      req.user.id,
      `Your complaint "${title}" has been submitted and analysed by AI. View your dashboard for the legal guide.`,
      'complaint'
    );

    // Create Notification for all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        `New citizen complaint submitted: "${title}" in ${district}, ${state}.`,
        'complaint'
      );
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully and analyzed by AI.',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all complaints (Citizen: own, Advocate/Admin: all)
 * @route   GET /api/complaints
 * @access  Private
 */
const getComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query conditions
    const query = {};

    // Citizens can only view their own complaints
    if (req.user.role === 'citizen') {
      query.citizen = req.user.id;
    }

    // Apply Search Filters
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }
    if (req.query.state && req.query.state !== 'All') {
      query.state = req.query.state;
    }
    if (req.query.startDate && req.query.endDate) {
      query.incidentDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Sorting
    let sortBy = { createdAt: -1 };
    if (req.query.sort) {
      const parts = req.query.sort.split(':');
      sortBy = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('citizen', 'username email')
      .sort(sortBy)
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
 * @desc    Get single complaint details
 * @route   GET /api/complaints/:id
 * @access  Private
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'username email profileImage')
      .populate('advocateReplies.advocate', 'username email profileImage');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Restrict citizen from viewing other citizens' complaints
    if (req.user.role === 'citizen' && complaint.citizen._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ask follow-up questions to Gemini AI legal assistant
 * @route   POST /api/complaints/:id/chat
 * @access  Private (Citizen)
 */
const askFollowUp = async (req, res, next) => {
  const { message } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please enter a message' });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to chat about this case' });
    }

    // Append user message to history
    complaint.followUpChat.push({
      role: 'user',
      message,
      timestamp: new Date()
    });

    // Run Gemini Chat response
    const complaintSummaryInfo = {
      title: complaint.title,
      category: complaint.category,
      description: complaint.description
    };

    const aiReply = await geminiService.getChatReply(
      complaint.followUpChat,
      message,
      complaintSummaryInfo
    );

    // Append model response to history
    complaint.followUpChat.push({
      role: 'model',
      message: aiReply,
      timestamp: new Date()
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      chat: complaint.followUpChat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download legal report as PDF
 * @route   GET /api/complaints/:id/pdf
 * @access  Private
 */
const downloadPdfReport = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'username email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role === 'citizen' && complaint.citizen._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this report' });
    }

    // Set headers for file transfer
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=LegalAssist_Report_${complaint._id}.pdf`);

    // Stream PDF directly to client response
    pdfService.generateComplaintPDF(complaint, res);

    // Create Notification about PDF report generation
    await createNotification(
      complaint.citizen._id,
      `Your legal report for case "${complaint.title}" has been successfully exported as PDF.`,
      'report'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request a video consultation slot from an advocate
 * @route   POST /api/complaints/:id/slots/request
 * @access  Private (Citizen)
 */
const requestVideoSlot = async (req, res, next) => {
  const { advocateId, requestedTime } = req.body;

  try {
    if (!advocateId || !requestedTime) {
      return res.status(400).json({ success: false, message: 'Please provide advocate ID and preferred date/time.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Case dossier not found.' });
    }

    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to request slots for this case.' });
    }

    const advocate = await User.findOne({ _id: advocateId, role: 'advocate' });
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate not found.' });
    }

    // Verify chosen time matches an available unbooked slot on advocate profile
    const slotMatch = advocate.availabilitySlots.find(
      s => new Date(s.time).getTime() === new Date(requestedTime).getTime() && !s.isBooked
    );
    if (!slotMatch) {
      return res.status(400).json({ success: false, message: 'The selected availability slot is no longer open.' });
    }

    // Check if slot request already exists for this advocate and is pending/scheduled
    const existing = complaint.videoSlots.find(
      s => s.advocate.toString() === advocateId && ['pending', 'scheduled'].includes(s.status)
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending or active slot request with this advocate.' });
    }

    // Mark advocate slot as booked
    slotMatch.isBooked = true;
    await advocate.save();

    // Add slot request to complaint dossier
    complaint.videoSlots.push({
      advocate: advocateId,
      requestedTime: new Date(requestedTime),
      status: 'pending'
    });

    await complaint.save();

    // Notify the advocate
    await createNotification(
      advocateId,
      `Citizen ${req.user.username} has requested a video consultation slot for case: "${complaint.title}".`,
      'complaint'
    );

    res.status(201).json({ success: true, message: 'Consultation slot request submitted to advocate.', slots: complaint.videoSlots });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Schedule/Approve a requested video slot
 * @route   PUT /api/complaints/:id/slots/:slotId/schedule
 * @access  Private (Advocate)
 */
const scheduleVideoSlot = async (req, res, next) => {
  const { scheduledTime, status } = req.body; // status: 'scheduled' or 'rejected'

  try {
    if (!status || !['scheduled', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide valid status: scheduled or rejected.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Case dossier not found.' });
    }

    const slot = complaint.videoSlots.id(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Video slot request not found.' });
    }

    if (slot.advocate.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this slot request.' });
    }

    slot.status = status;

    if (status === 'scheduled') {
      if (!scheduledTime) {
        return res.status(400).json({ success: false, message: 'Please provide a confirmed date/time.' });
      }
      slot.scheduledTime = new Date(scheduledTime);
      
      const cleanTitle = complaint.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
      slot.meetingUrl = `https://meet.jit.si/LegalAssist-Consultation-${cleanTitle}-${complaint._id}-${slot._id}`;
    } else if (status === 'rejected') {
      // Release slot back to available on advocate's profile
      const advocate = await User.findById(req.user.id);
      if (advocate) {
        const advSlot = advocate.availabilitySlots.find(
          s => new Date(s.time).getTime() === new Date(slot.requestedTime).getTime()
        );
        if (advSlot) {
          advSlot.isBooked = false;
          await advocate.save();
        }
      }
    }

    await complaint.save();

    // Notify the citizen
    const formattedDate = status === 'scheduled' ? new Date(scheduledTime).toLocaleString() : '';
    const alertMessage = status === 'scheduled' 
      ? `Advocate ${req.user.username} has confirmed your video consultation for ${formattedDate}.`
      : `Advocate ${req.user.username} has declined your video consultation request.`;

    await createNotification(
      complaint.citizen,
      alertMessage,
      'reply'
    );

    res.status(200).json({ success: true, message: `Video call request ${status}.`, slots: complaint.videoSlots });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel/Delete a video slot request
 * @route   DELETE /api/complaints/:id/slots/:slotId
 * @access  Private (Citizen)
 */
const deleteVideoSlot = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Case dossier not found.' });
    }

    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify slots for this case.' });
    }

    const slot = complaint.videoSlots.id(req.params.slotId);
    if (slot) {
      // Release slot back to available on advocate's profile
      const advocate = await User.findById(slot.advocate);
      if (advocate) {
        const advSlot = advocate.availabilitySlots.find(
          s => new Date(s.time).getTime() === new Date(slot.requestedTime).getTime()
        );
        if (advSlot) {
          advSlot.isBooked = false;
          await advocate.save();
        }
      }
    }

    // Pull/remove the slot
    complaint.videoSlots.pull({ _id: req.params.slotId });
    await complaint.save();

    res.status(200).json({ success: true, message: 'Video slot request cleared.', slots: complaint.videoSlots });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate paying consultation fee for advocate reply
 * @route   POST /api/complaints/:id/replies/:replyId/pay
 * @access  Private (Citizen)
 */
const payConsultationFee = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Case dossier not found.' });
    }

    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay fees for this case.' });
    }

    const reply = complaint.advocateReplies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Advocate reply not found.' });
    }

    if (reply.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Fee for this consultation has already been paid.' });
    }

    // Update payment details
    reply.paymentStatus = 'paid';
    reply.transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    await complaint.save();

    // Create Notification
    await createNotification(
      complaint.citizen,
      `Payment of ₹${reply.consultationFee} successfully processed for Advocate consultation. Receipt ID: ${reply.transactionId}`,
      'reply'
    );

    res.status(200).json({ success: true, message: 'Payment successfully simulated!', complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Translate case dossier's AI response report
 * @route   POST /api/complaints/:id/translate
 * @access  Private
 */
const translateComplaintReport = async (req, res, next) => {
  const { targetLanguage } = req.body;
  try {
    if (!targetLanguage) {
      return res.status(400).json({ success: false, message: 'Please specify a target language.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (!complaint.aiResponse) {
      return res.status(400).json({ success: false, message: 'No AI guidance report exists to translate.' });
    }

    const translated = await geminiService.translateReport(complaint.aiResponse, targetLanguage);

    res.status(200).json({ success: true, translated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitComplaint,
  getComplaints,
  getComplaintById,
  askFollowUp,
  downloadPdfReport,
  requestVideoSlot,
  scheduleVideoSlot,
  deleteVideoSlot,
  payConsultationFee,
  translateComplaintReport
};
