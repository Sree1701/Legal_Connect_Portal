const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');

/**
 * @desc    Get system-wide dashboard stats & charts data
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core Summary Cards
    const totalUsers = await User.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const activeAdvocates = await User.countDocuments({ role: 'advocate' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });

    // 2. Complaint Categories Pie Chart aggregation
    const categoriesData = await Complaint.aggregate([
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    // 3. Complaint Statuses aggregation
    const statusesData = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 4. Monthly Trend (last 6 months) Line Chart aggregation
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrends = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendsData = monthlyTrends.map(item => {
      return {
        month: `${months[item._id.month - 1]} ${item._id.year}`,
        Complaints: item.count
      };
    });

    // 4.5. State-wise aggregation for Geo-distribution charts (Heatmap)
    const stateData = await Complaint.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $project: { state: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // 5. Recent Activity
    const recentFeedbacks = await Feedback.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalComplaints,
        activeAdvocates,
        pendingComplaints,
        resolvedComplaints
      },
      charts: {
        categories: categoriesData,
        statuses: statusesData,
        trends: trendsData,
        states: stateData
      },
      recentFeedbacks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      query.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.role && req.query.role !== 'All') {
      query.role = req.query.role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details/role
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin)
 */
const updateUserRole = async (req, res, next) => {
  const { role } = req.body;

  try {
    if (!role || !['citizen', 'advocate', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete user complaints and feedback to clean up
    await Complaint.deleteMany({ citizen: user._id });
    await Feedback.deleteMany({ user: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and all related records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manage complaint status
 * @route   PUT /api/admin/complaints/:id
 * @access  Private (Admin)
 */
const updateComplaintStatus = async (req, res, next) => {
  const { status } = req.body;

  try {
    if (!status || !['pending', 'under_review', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint status' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status} successfully`,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete complaint
 * @route   DELETE /api/admin/complaints/:id
 * @access  Private (Admin)
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  updateComplaintStatus,
  deleteComplaint
};
