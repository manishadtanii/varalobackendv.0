import User from '../models/userModel.js';

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -verificationCode -forgotPasswordCode -verificationCodeValidation -forgotPasswordCodeValidation -otpAttempts');
    return res.status(200).json({ message: 'Users fetched', data: users });
  } catch (err) {
    console.error('Get Admin Users Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
