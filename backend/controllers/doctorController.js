import doctorModel from "../models/doctorModel.js";
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


const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email']);
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export { changeAvailability,doctorList};
