import express from "express";
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment } from "../controllers/userController.js";
import authUser from "../middleware/authUser.js";
import { uploadSingle } from '../middleware/multer.js';  // Import the specific file upload middleware

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/get-profile", authUser, getProfile);
userRouter.post('/update-profile',authUser, uploadSingle, updateProfile);  // Use uploadSingle as middleware
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.post('/appointments',authUser,listAppointment)

export default userRouter;
