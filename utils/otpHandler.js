const otpModel = require("../models/otpModel");
const mailService = require("../services/mailer");

/**
 * Generate OTP
 */
const generateOTP = async (type, email) => {
  if (!type || !email) {
    throw new Error("Type and email are required");
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000)); // string OTP
  const expired_at = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  // Remove old OTPs for same email & type
  await otpModel.deleteMany({ email, type });

  await otpModel.create({
    type,
    email,
    otp,
    expired_at,
  });

  await mailService.sendOtpEmail(email, otp);

  return {
    email,
    type,
    expired_at,
  };
};

/**
 * Verify OTP
 */
const OTPVerify = async (type, email, otp) => {
  if (!type || !email || !otp) {
    return { status: false, message: "All fields are required" };
  }

  const record = await otpModel
    .findOne({ type, email })
    .sort({ createdAt: -1 });

  if (!record) {
    return { status: false, message: "OTP request not found" };
  }

  if (new Date() > record.expired_at) {
    await otpModel.deleteOne({ _id: record._id });
    return { status: false, message: "OTP expired" };
  }

  if (String(otp) !== record.otp) {
    return { status: false, message: "OTP invalid" };
  }

  // OTP is single-use
  await otpModel.deleteOne({ _id: record._id });

  return { status: true, message: "OTP verified" };
};

module.exports = {
  generateOTP,
  OTPVerify,
};
