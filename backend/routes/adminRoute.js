import express from "express";
import { addDoctor, allDoctors, loginAdmin,appointmentsAdmin,appointmentCancel,adminDashboard } from "../controllers/adminController.js";
import { uploadSingle  } from "../middleware/multer.js"; 
import authAdmin from "../middleware/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

adminRouter.post('/add-doctor', authAdmin, uploadSingle, addDoctor); // ✅ Uses uploadSingle
adminRouter.post('/loginAdmin', loginAdmin);
adminRouter.post('/all-doctors', authAdmin, allDoctors);
adminRouter.post('/change-availability', authAdmin, changeAvailability);
adminRouter.get('/appointments', authAdmin, appointmentsAdmin);
adminRouter.post('/cancel-appointment', authAdmin,appointmentCancel);
adminRouter.get('/dashboard', authAdmin,adminDashboard);

export default adminRouter;
