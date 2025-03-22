import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments } = useContext(DoctorContext);
  const { slotDateFormat } = useContext(AppContext);
  const { currency } = useContext(AdminContext);

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    return today.getFullYear() - birthDate.getFullYear();
  };

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl mx-auto mt-5">
      <p className="mb-3 text-lg font-semibold text-gray-700">All Appointments</p>

      <div className="bg-white shadow-md border rounded-lg text-sm max-h-[80vh] overflow-y-auto">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-3 py-3 px-6 border-b bg-gray-100 font-medium text-gray-700">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Appointments List */}
        {appointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-3 items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50 transition duration-200"
            key={index}
          >
            <p className="hidden sm:block">{index + 1}</p>

            {/* Patient Info */}
            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full border"
                src={item.userData.image}
                alt="Patient"
              />
              <p>{item.userData.name}</p>
            </div>

            {/* Payment Status */}
            <p
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                item.payment ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-700"
              }`}
            >
              {item.payment ? "Online" : "CASH"}
            </p>

            {/* Age */}
            <p>{calculateAge(item?.userData?.dob)}</p>

            {/* Appointment Date & Time */}
            <p>
              {item?.slotDate ? slotDateFormat(item.slotDate) : "No Date"},{" "}
              {item?.slotTime || "No Time"}
            </p>

            {/* Fees */}
            <p>{currency || "$"}{item?.amount || "N/A"}</p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <img className="w-8 cursor-pointer hover:opacity-80 transition" src={assets.cancel_icon} alt="Cancel" />
              <img className="w-8 cursor-pointer hover:opacity-80 transition" src={assets.tick_icon} alt="View" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
