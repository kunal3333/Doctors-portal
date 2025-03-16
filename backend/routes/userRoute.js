import express from "express";
import { registerUser, loginUser, getProfile, updateProfile } from "../controllers/userController.js";
import authUser from "../middleware/authUser.js";
import { uploadSingle } from '../middleware/multer.js';  // Import the specific file upload middleware

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/get-profile", authUser, getProfile);

// Correct usage of the file upload middleware
userRouter.post('/update-profile',authUser, uploadSingle, updateProfile);  // Use uploadSingle as middleware

export default userRouter;
