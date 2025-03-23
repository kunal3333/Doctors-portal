import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // ✅ Import jwt
import appointmentModel from "../models/appointmentModel.js";

// API for changing doctor's availability
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      docId,
      { available: !docData.available },
      { new: true } // This ensures it returns the updated document
    );

    res.json({
      success: true,
      message: "Availability Changed",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to show doctors list
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to login doctors
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor appointment for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.docId;
    const appointments = await appointmentModel
      .find({ docId })
      .populate("userData", "name image dob");

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body; 

    const appointmentData = await appointmentModel.findById(appointmentId); 

    if (appointmentData && appointmentData.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({
        success: false,
        message: "Mark failed: Doctor or appointment mismatch",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment completed for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const docId = req.docId; // Extracted from token
    const { appointmentId } = req.body;

    console.log("Received Cancel Request for Appointment ID:", appointmentId);
    console.log("Doctor ID from Token:", docId);

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    console.log("Doctor Assigned to Appointment:", appointmentData.docId.toString());

    if (appointmentData.docId.toString() !== docId) {
      return res.status(403).json({
        success: false,
        message: "Cancellation failed: Doctor or appointment mismatch",
      });
    }

    appointmentData.cancelled = true;
    await appointmentData.save();

    res.json({ success: true, message: "Appointment successfully cancelled" });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Api  to get dashboard data for doctor pannel
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.docId; // ✅ Get docId from middleware

    if (!docId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No doctor ID found" });
    }

    console.log("Fetching Dashboard Data for Doctor ID:", docId); // ✅ Debugging

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    let patients = [];

    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings, // ✅ Ensure key names match frontend expectations
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    console.log("Sending Dashboard Data:", dashData); // ✅ Debugging

    res.json({ success: true, dashData });
  } catch (error) {
    console.error("Doctor Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard
};
