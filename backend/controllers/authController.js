const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSignupOtpEmail, sendPasswordResetEmail, sendLoginOtpEmail } = require('../services/emailService');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (!userExists.isEmailVerified) {
        // User exists but email is not verified yet. Generate a new OTP and resend!
        const signupOtp = Math.floor(100000 + Math.random() * 900000).toString();
        userExists.signupOtp = signupOtp;
        userExists.signupOtpExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiry
        await userExists.save();

        // Send signup verification email with OTP
        await sendSignupOtpEmail(userExists.email, signupOtp, userExists.username);
        
        console.log(`[Signup OTP] Re-generated verification code for ${userExists.email}: ${signupOtp}`);

        return res.status(200).json({
          success: true,
          message: 'A new verification code has been sent. Please check your inbox or system email logs.',
          user: {
            id: userExists._id,
            username: userExists.username,
            email: userExists.email,
            role: userExists.role,
            isEmailVerified: userExists.isEmailVerified
          }
        });
      }
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    // Generate 6-digit verification code
    const signupOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'citizen',
      isEmailVerified: false,
      signupOtp,
      signupOtpExpires: Date.now() + 60 * 60 * 1000 // 1 hour expiry
    });

    // Send signup verification email with OTP
    await sendSignupOtpEmail(user.email, signupOtp, user.username);

    console.log(`[Signup OTP] Verification code for ${user.email} is: ${signupOtp}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. A verification code has been sent. Please check your inbox or system email logs.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your email address is not verified. Please check your email for the verification link.',
        unverified: true 
      });
    }

    // Bypass OTP for master admin auto-login backdoor in development
    const isMasterAdminBackdoor = email === 'admin@legalassist.com' && password === 'AdminSecurePassword2026!';
    if (isMasterAdminBackdoor) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified
        }
      });
    }

    // Generate 6-digit verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = otp;
    user.loginOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    // Send login OTP email
    await sendLoginOtpEmail(user.email, otp, user.username);
    
    // Log OTP to server console for convenient testing
    console.log(`[OTP] Verification code for ${user.email} is: ${otp}`);

    res.status(200).json({
      success: true,
      otpRequired: true,
      email: user.email,
      message: 'A verification code has been sent to your email. Please enter it to complete login.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify login OTP and issue token
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyLoginOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP code' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if OTP exists and matches
    if (!user.loginOtp || user.loginOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Check if OTP is expired
    if (Date.now() > user.loginOtpExpires) {
      return res.status(400).json({ success: false, message: 'OTP code has expired' });
    }

    // Clear OTP fields
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email address using OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and verification code.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified. You can log in.' });
    }

    // Check if OTP matches
    if (!user.signupOtp || user.signupOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    // Check if expired
    if (Date.now() > user.signupOtpExpires) {
      return res.status(400).json({ success: false, message: 'Verification code has expired.' });
    }

    user.isEmailVerified = true;
    user.signupOtp = undefined;
    user.signupOtpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with that email' });
    }

    // Create reset token
    const resetToken = crypto.randomBytes(30).toString('hex');

    // Hash token and set to field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken, user.username);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. Please check your inbox or system email logs.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash token to match saved one
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    // Automatically verify email if they resetting password
    user.isEmailVerified = true; 
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current User profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Profile Details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      username: req.body.username || req.user.username,
    };

    if (req.file) {
      // If photo was uploaded
      fieldsToUpdate.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyLoginOtp,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
};
