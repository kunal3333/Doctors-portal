import express from "express"
import { addDoctor,allDoctors,loginAdmin } from "../controller/adminController.js"
import upload from "../middleware/multer.js"
import authAdmin from "../middleware/authAdmin.js"

const adminRouter = express.Router()

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor);
adminRouter.post('/loginAdmin',loginAdmin);
adminRouter.post('/all-doctors',authAdmin,allDoctors);


export default adminRouter;