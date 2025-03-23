import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyAppointments = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    console.error("AppContext is undefined. Ensure MyAppointments is wrapped in AppContextProvider.");
    return <p className="text-red-500">Error: AppContext is not available.</p>;
  }

  const { backendUrl, token } = context;
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  // Fetch Appointments
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

  // Cancel Appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        toast.success(data.message);
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

  // Initialize Razorpay Payment
  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verifyRazorpay`, response,
            { headers: { Authorization: `Bearer ${token}` } }
          );   
          if (data.success) {
            getUserAppointments();
            navigate('/my-appointment');
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Handle Razorpay Payment
  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,  
        { appointmentId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        initPay(data.order);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed.");
    }
  };

  useEffect(() => {
    getUserAppointments();
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My Appointments</p>
      <div>
        {appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div key={index} className={`grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b ${item.canceled ? 'opacity-50' : ''}`}>
              {/* Doctor Image */}
              <div>
                <img className="w-32 bg-indigo-50" src={item.docData?.image || '/default-avatar.png'} alt="Doctor" />
              </div>

              {/* Appointment Details */}
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

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 justify-end">
                {!item.canceled && item.payment && !item.isCompleted && (<button className="sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50">Paid</button>)}
                {!item.canceled && !item.payment && !item.isCompleted &&  (<button onClick={() => appointmentRazorpay(item._id)} className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300">Pay Online</button>)}
                {!item.canceled && !item.isCompleted && (<button onClick={() => cancelAppointment(item._id)} className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300">Cancel Appointment</button>)}
                {item.canceled && !item.isCompleted &&  (<button className="sm:min-w-48 py-2 border-red-500 text-red-500 bg-red-100 cursor-not-allowed">Appointment Canceled</button>)}
              </div>
            </div >
          ))
        ) : (
          <p className="text-center text-gray-500 mt-6">No appointments found</p>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
