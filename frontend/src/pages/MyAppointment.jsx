import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';  
import { toast } from 'react-toastify';  

const MyAppointments = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    console.error("AppContext is undefined. Ensure MyAppointments is wrapped in AppContextProvider.");
    return <p className="text-red-500">Error: AppContext is not available.</p>;
  }

  const { backendUrl, token } = context;
  const [appointments, setAppointments] = useState([]);

  const getUserAppointments = async () => {
    if (!token) {
      toast.warn("Please log in to view appointments.");
      return;
    }
  
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/appointments`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error("Failed to fetch appointments.");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.response?.data?.message || "Failed to fetch appointments.");
    }
  };
  
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        toast.success(data.message);
        
        // Update the state locally instead of refetching
        setAppointments(prevAppointments => 
          prevAppointments.map(appt => 
            appt._id === appointmentId ? { ...appt, canceled: true } : appt
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      toast.error(error.response?.data?.message || "Failed to cancel appointment.");
    }
  };


const initpay = (order) => {
  
  const option ={
    key:import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name:'Appointment Payment',
    description:'Appointment Payment',
    order_id: order.id,
    receipt:order.receipt,
    handler: async (response) => {
      console.log(response)
    }
  }
  const rzp = new window.Razorpay(option)
  rzp.open()
}
  

   const appointmentRazorpay = async (appointmentId) => {
    
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,  
        { appointmentId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if(data.success){
        
        initpay(data.order)   
         }
    } catch (error) {

    }
    
   }

  useEffect(() => {
    getUserAppointments();
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My appointments</p>
      <div>
        {appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b">
              <div>
                <img className="w-32 bg-indigo-50" src={item.docData?.image || '/default-avatar.png'} alt="Doctor" />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">{item.docData?.name || "N/A"}</p>
                <p>{item.docData?.speciality || "No Speciality"}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{item.docData?.address?.line1 || "No Address"}</p>
                <p className="text-xs">{item.docData?.address?.line2 || ""}</p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">Date & Time: </span>
                  {item.slotDate || "Unknown"} | {item.slotTime || "Unknown"}
                </p>
              </div>

              <div className="flex flex-col gap-2 justify-end">
                {!item.canceled && (
                  <>
                    <button onClick={()=> appointmentRazorpay(item._id)} className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300">
                      Pay Online
                    </button>
                    <button 
                      onClick={() => cancelAppointment(item._id)} 
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {item.canceled && (
                  <button className="sm:min-w-48 py-2 border-red-500 text-red-500 bg-red-100 cursor-not-allowed">
                    Appointment Canceled
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-6">No appointments found</p>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
