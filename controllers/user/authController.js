const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailService = require('../../services/mailer');
const { getLocalIPInfo } = require('../../utils/ipinfo');
const generateUsername = require('../../utils/generateUsername');
const RegisterToken = require('../../models/RegisterToken');
const { generateOTP, OTPVerify } = require('../../utils/otpHandler');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
       const userExist = await User.findOne({email});
        if (userExist) {
            return res.status(404).json({ message: 'User already exist' });
        }

    const existingToken = await RegisterToken.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    if (existingToken) {
      existingToken.data = userData;
      await existingToken.save();
    } else {
      await RegisterToken.create({
        email,
        data: userData,
      });
    }
   const result = await generateOTP("register", email)

    return res.status(200).json({ message: "User registered successfully", data : result });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const login = async (req, res) => {
   
    const { user, password } = req.body;

    try {
        const userExist = await User.findOne({$or: [ { email:user},{username:user}]});
        if (!userExist) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
           const payload = {
            user: {
                id: userExist.id,
                role: userExist.role
            }
        };

    
     

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
       // await mailService.sendLoginAlertEmail(userExist.email, userExist.name, new Date());
       
        await getLocalIPInfo();
        res.json({ status: 'success', message: 'Login successful' , token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        await mailService.sendPasswordResetEmail(email, user.name, resetLink);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
}
const resetPassword = async (req, res) => {
    const { newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
          await mailService.sendResetConfirmationEmail(user.email, user.name);
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
}

const resendOTP = async (req,res) => {
 const {email,type } = req.body;

  if (!email || !type) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
 
   const result = await generateOTP(type, email)

    return res.status(200).json({ message: "OTP sent Successfully", data : result });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

const verifyOTP = async (req, res) => {
  const { email, type, otp } = req.body;

  if (!email || !type || !otp) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // ✅ Verify OTP (throws if invalid / expired)
   const  result =  await OTPVerify(email, type, otp);

  if(result && !result.status){
     return res.status(400).json({ message: result.message });
  }

    /* ---------------- REGISTER FLOW ---------------- */
    if (type === "register") {
      const existingToken = await RegisterToken.findOne({ email });
      if (!existingToken) {
        return res.status(400).json({ message: "Registration session expired" });
      }

      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await User.create(existingToken.data);

      await RegisterToken.findByIdAndDelete(existingToken._id);

      return res.status(200).json({
        message: "User registered successfully",
        userId: user._id,
      });
    }

    /* ---------------- LOGIN FLOW ---------------- */
    if (type === "login") {
      const userExist = await User.findOne({ email });
      if (!userExist) {
        return res.status(401).json({ message: "User not found" });
      }

      const token = generateToken(userExist);

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: userExist._id,
          email: userExist.email,
          name: userExist.name,
        },
      });
    }

    return res.status(400).json({ message: "Invalid OTP type" });

  } catch (error) {
    console.error("OTP Verify Error:", error.message);

    return res.status(400).json({
      message: error.message || "OTP verification failed",
    });
  }
};


module.exports = {
     register,
    login,
    forgotPassword,
    resetPassword,
    resendOTP,
    verifyOTP
};