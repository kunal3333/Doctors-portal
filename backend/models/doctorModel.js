import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    date: { type: Number, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, required: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    slots_booked: { type: Object, default: {} },
    available: { type: Boolean, required: true, default: true }, // Ensure default value
  },
  { minimize: false }
);

const doctorModel =
  mongoose.models.doctor || mongoose.model('doctor', doctorSchema);

export default doctorModel
