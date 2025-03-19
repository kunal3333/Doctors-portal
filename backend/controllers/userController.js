import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from 'razorpay'

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password should be at least 8 characters long",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new UserModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login API
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // userId from authUser middleware
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const userData = await UserModel.findById(userId).select("-password");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // userId from authUser middleware
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let parsedAddress = {};
    try {
      parsedAddress = JSON.parse(address);
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid address format" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { name, phone, address: parsedAddress, dob, gender },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (imageFile) {
      try {
        const result = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageURL = result.secure_url;

        await UserModel.findByIdAndUpdate(userId, { image: imageURL });
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }
    }

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Api to book Appointment
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.userId; // Get userId from auth middleware

    if (!userId || !docId || !slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    // Initialize slots_booked if it does not exist
    let slotsBooked = docData.slots_booked || {};

    // Check if slot is already booked
    if (slotsBooked[slotDate] && slotsBooked[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: "Slot not available" });
    }

    // Add the slot to booked slots
    if (!slotsBooked[slotDate]) {
      slotsBooked[slotDate] = [];
    }
    slotsBooked[slotDate].push(slotTime);

    // Fetch user data
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Create appointment
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: new Date(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save updated slots to doctor model
    await doctorModel.findByIdAndUpdate(docId, { slots_booked: slotsBooked });

    res.json({ success: true, message: "Appointment Booked Successfully" });
  } catch (error) {
    console.error("Error Booking Appointment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//api to get user appointment for frontend my-appointment page 
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId; // Use userId from auth middleware

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//Api to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from auth middleware
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Verify if the user owns the appointment
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // Releasing doctor's slots
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    if (doctorData && doctorData.slots_booked[slotDate]) {
      doctorData.slots_booked[slotDate] = doctorData.slots_booked[slotDate].filter(e => e !== slotTime);
      await doctorModel.findByIdAndUpdate(docId, { slots_booked: doctorData.slots_booked });
    }

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Api for paymtam gatyway razorpay

const razorpayInstance = new razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET
})


const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData.cancelled) {
      return res.status(400).json({ success: false, message: "This appointment has already been canceled" });
    }

    // Ensure razorpayInstance is defined
    if (!razorpayInstance) {
      return res.status(500).json({ success: false, message: "Razorpay instance is not initialized" });
    }

    console.log("Creating Razorpay Order with:", {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    });

    // Creating Razorpay order
    const options = {
      amount: appointmentData.amount * 100, // Convert to paise
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });

  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export { registerUser, loginUser, getProfile, updateProfile,bookAppointment ,listAppointment,cancelAppointment,paymentRazorpay};
