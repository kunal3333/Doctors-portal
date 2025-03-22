import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // ✅ Import jwt
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

        res.json({ success: true, message: "Availability Changed", doctor: updatedDoctor });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to show doctors list
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email']);
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
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (isMatch) {
            const token = jwt.sign
            ({ id: doctor._id },
             process.env.JWT_SECRET, 
             { expiresIn: "1d" }); 
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); 
    }
};


// api to get doctor appointment for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const docId = req.docId; 
        const appointments = await appointmentModel.find({ docId }).populate("userData", "name image dob");

        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export { changeAvailability, doctorList, loginDoctor,appointmentsDoctor };
