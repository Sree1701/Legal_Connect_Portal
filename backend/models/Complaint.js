const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  filename: { type: String, required: true }
});

const advocateReplySchema = new mongoose.Schema({
  advocate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  replyDate: { type: Date, default: Date.now },
  videoMeetingUrl: { type: String, default: '' },
  consultationFee: { type: Number, default: 500 },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  transactionId: { type: String, default: '' }
});

const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const videoSlotSchema = new mongoose.Schema({
  advocate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedTime: { type: Date, required: true },
  scheduledTime: { type: Date },
  status: { type: String, enum: ['pending', 'scheduled', 'rejected'], default: 'pending' },
  meetingUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const aiLawSchema = new mongoose.Schema({
  law: { type: String, required: true },
  description: { type: String, required: true }
});

const aiFaqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const aiResponseSchema = new mongoose.Schema({
  summary: { type: String, required: true },
  classification: { type: String, required: true },
  applicableLaws: [aiLawSchema],
  suggestedAuthority: { type: String, required: true },
  requiredDocuments: [String],
  stepByStepProcedure: [String],
  nextActions: [String],
  preventiveTips: [String],
  faqs: [aiFaqSchema],
  disclaimer: { type: String, required: true }
});

const complaintSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a complaint title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a complaint description']
  },
  incidentDate: {
    type: Date,
    required: [true, 'Please add an incident date']
  },
  state: {
    type: String,
    required: [true, 'Please add the state']
  },
  district: {
    type: String,
    required: [true, 'Please add the district']
  },
  category: {
    type: String,
    default: 'General'
  },
  documents: [documentSchema],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved'],
    default: 'pending'
  },
  aiResponse: aiResponseSchema,
  advocateReplies: [advocateReplySchema],
  videoSlots: [videoSlotSchema],
  followUpChat: [chatMessageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
