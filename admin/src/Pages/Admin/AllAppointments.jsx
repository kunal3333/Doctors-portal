import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, currency,    cancelAppointment  } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);

  // Function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "N/A"; // Handle missing DOB
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    return age;
  };

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-scroll">
        <div className="hidden sm:grid grid-col-[0.5fr_3fr_1fr_3fr_3fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid-cols-[0.5_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>

            {/* Patient Info */}
            <div className="flex items-center gap-2">
              <img className="w-8 rounded-full" src={item?.userData?.image || ""} alt="Patient" />
              <p>{item?.userData?.name || "Unknown"}</p>
            </div>

            {/* Age */}
            <p className="max-sm:hidden">{calculateAge(item?.userData?.dob)}</p>

            {/* Date & Time */}
            <p>
              {item?.slotDate ? slotDateFormat(item.slotDate) : "No Date"},{" "}
              {item?.slotTime || "No Time"}
            </p>

            {/* Doctor Info */}
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full bg-gray-200"
                src={item?.docData?.image || ""}
                alt="Doctor"
              />
              <p>{item?.docData?.name || "Unknown"}</p>
            </div>

            {/* Fees */}
            <p>{currency || "$"}{item?.amount || "N/A"}</p>

            {item.cancelled 
            ? <p className="text-red-400 text-xs font-medium">Cancelled</p>
            : <img onClick={()=>cancelAppointment(item._Id)} className="w-10 cursor-pointer" src={assets.cancel_icon} alt="Cancel" />
            }
            
           
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
