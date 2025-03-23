import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [appointments, setAppointments] = useState([]);
  const [dashData,setDashData] = useState(false)
  const [profileData, setProfileData] = useState(false)
  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const getAppointments = async () => {
    try {
      if (!dToken) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("dToken");
        setDToken("");
        return;
      }
  
      // Decode JWT token to check expiration
      try {
        const decodedToken = JSON.parse(atob(dToken.split(".")[1]));
        const expiryTime = new Date(decodedToken.exp * 1000);
        console.log("Token Expiry Time:", expiryTime);
  
        if (expiryTime < new Date()) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("dToken");
          setDToken("");
          return;
        }
      } catch (error) {
        console.error("Invalid token format:", error);
        toast.error("Invalid session. Please login again.");
        localStorage.removeItem("dToken");
        setDToken("");
        return;
      }
  
      console.log("Fetching Appointments with Token:", dToken);
      
      const response = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      });
  
      if (response.data.success) {
        setAppointments(response.data.appointments);
      } else {
        toast.error(response.data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching doctor appointments:", error.response?.data || error.message);
      toast.error("Error fetching appointments. Please try again.");
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      // if (!dToken) {
      //   toast.error("Session expired. Please login again.");
      //   return;
      // }
  
      // if (!appointmentId) {
      //   toast.error("Invalid appointment. Please try again.");
      //   return;
      // }
  
      // const decodedToken = JSON.parse(atob(dToken.split(".")[1]));
      // const doctorId = decodedToken.id; 
  
      // const appointment = appointments.find(appt => appt._id === appointmentId);
      // if (!appointment) {
      //   toast.error("Appointment not found.");
      //   return;
      // }
  
      // console.log("Doctor from Token (Logged-in Doctor):", doctorId);
      // console.log("Doctor assigned to Appointment (From DB):", appointment.doctorId);
      // console.log("Full Appointment Object:", appointment);
  
      // if (String(appointment.doctorId) !== String(doctorId)) {
      //   toast.error("You are not assigned to this appointment.");
      //   return;
      // }
  
      const {data} = await axios.post(
        `${backendUrl}/api/doctor/complete-appointment`,
        { appointmentId}, 
        { headers: { Authorization: `Bearer ${dToken}` },
        }
);
  
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message || "Failed to complete appointment");
      }
    } catch (error) {
      console.error("Error completing appointment:", error.response?.data || error.message);
      toast.error("Error completing appointment. Please try again.");
    }
  };
  
  const cancelAppointment = async (appointmentId) => {
    try {
      if (!dToken) {
        toast.error("Session expired. Please login again.");
        return;
      }
  
      if (!appointmentId) {
        toast.error("Invalid appointment. Please try again.");
        return;
      }
  
      const decodedToken = JSON.parse(atob(dToken.split(".")[1]));
      const doctorId = decodedToken.id; // Extract doctor ID from token
  
      console.log("Canceling Appointment ID:", appointmentId);
      console.log("Doctor ID:", doctorId);
  
      const response = await axios.post(
        `${backendUrl}/api/doctor/cancel-appointment`,
        { appointmentId, doctorId }, // Include doctorId
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );
  
      if (response.data.success) {
        toast.success(response.data.message);
        getAppointments();
      } else {
        toast.error(response.data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error.response?.data || error.message);
      toast.error("Error canceling appointment. Please try again.");
    }
  };
  
  const getDashData = async () => {
    try {
      if (!dToken) {
        toast.error("Session expired. Please log in again.");
        return;
      }
  
      // console.log("Fetching Dashboard Data with Token:", dToken);
  
      const response = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
  
      if (response.data.success) {
        setDashData(response.data.dashData);
        // console.log("Dashboard Data:", response.data.dashData); 
      } else {
        toast.error(response.data.message || "Failed to load dashboard");
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error.response?.data || error);
      toast.error("Error fetching dashboard data.");
    }
  };

  const getProfileData = async ( ) => {
    try {
      if (!dToken) {
        toast.error("Session expired. Please log in again.");
        return;
      }
  
      console.log("Updating Profile Data:", getProfileData); // ✅ Debugging
  
      const response = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        getProfileData,
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
  
      if (response.data.success) {
        setProfileData(response.data.profileData); // ✅ Update profile state
        toast.success(response.data.message);
        return response.data;
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile Update Error:", error.response?.data || error);
      toast.error("Error updating profile.");
    }
  };

  const updateDoctorProfile = async (updateData) => {
    try {
      if (!dToken) {
        toast.error("Session expired. Please log in again.");
        return;
      }
  
      console.log("Updating Profile Data:", updateData); // ✅ Debugging
  
      const response = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        updateData,
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
  
      if (response.data.success) {
        setProfileData(response.data.profileData); // ✅ Update profile state
        toast.success(response.data.message);
        return response.data;
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile Update Error:", error.response?.data || error);
      toast.error("Error updating profile.");
    }
  };
  

  return (
    <DoctorContext.Provider
      value={{ dToken, setDToken, appointments, getAppointments, completeAppointment, cancelAppointment,dashData,setDashData,getDashData,profileData,setProfileData,getProfileData,updateDoctorProfile }}
    >
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
