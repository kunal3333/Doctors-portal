import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js"; 
import jwt from 'jsonwebtoken'

const addDoctor = async (req, res) => {

  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
    const imageFile = req.file;


console.log({ name, email, password, speciality, degree, experience, about, fees, address },imageFile);

    // Check for missing details

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.json({ success: false, message: "Missing details" });
    }

    // Email validation

    if (!validator.isEmail(email)) {  
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    // Strong password validation
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    const imgUrl = imageUpload.secure_url; 

    // Prepare doctor data

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
      address: JSON.parse(address), 
      date: Date.now(),
    };

    // Create new doctor and save

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

     res.json({ success: true, message: "Doctor Added" });  

  } 
  
  catch (error) {
    console.log(error);
     res.json({ success: false, message: error.message });  
  }
}

//Api for admin login 

const loginAdmin = async (req,res) => {
  try{

    const{email,password} = req.body

    if(email ===process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){

      console.log(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);


      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({success:true,token})

    }else{
       res.json({success:false,message:"Invalid credentials"})}
  }

  catch(error)
  {
    console.log(error)
    res.json({success:false,message:error.message})
  }
  
}


// Api to get all docter data 

const allDoctors = async (req,res) => {
  try {
    const doctor = await doctorModel.find({}).select('-password')
  } catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
  }
}

export { addDoctor,loginAdmin }
