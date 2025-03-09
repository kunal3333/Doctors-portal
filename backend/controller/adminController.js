import fs from "fs"; 
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js"; 
import jwt from 'jsonwebtoken'

const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    console.log({ name, email, password, speciality, degree, experience, about, fees, address }, imageFile);

    // Validate required fields
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary
    let imgUrl = "";
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imgUrl = imageUpload.secure_url;
      fs.unlinkSync(imageFile.path); // Delete local file after uploading
    } else {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    // Parse address (ensure JSON format)
    const parsedAddress = typeof address === "string" ? JSON.parse(address) : address;

    // Create doctor object
    const doctorData = {
      name,
      email,
      image: imgUrl,
      password: hashPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: parsedAddress,
      available: true,
      date: Date.now(),
    };

    // Save doctor to database
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    return res.status(201).json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.error("Error in addDoctor:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

//Api for admin login 

const loginAdmin = async (req,res) => {
  try{

    const{email,password} = req.body

    if(email ===process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

      return res.json({ success: true, token });

    }else{
      return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
}
catch (error) {
  console.error("Admin Login Error:", error);
  return res.status(500).json({ success: false, message: "Server Error" });
}
};


// Api to get all docter data 

const allDoctors = async (req,res) => {
  try {
    const doctor = await doctorModel.find({}).select('-password')
    res.json({success:true,doctors})
  } catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
  }
}

export { addDoctor,loginAdmin,allDoctors }
