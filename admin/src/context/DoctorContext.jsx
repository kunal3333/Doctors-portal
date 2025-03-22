import { createContext, useState } from "react";
import axios from 'axios';
import {toast} from 'react-toastify'



export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [dToken, setDToken] = useState(localStorage.getItem("dToken") ?localStorage.getItem('dToken'):'');
    const [appointments, setAppointments] = useState([])

    const getAppointments = async () => {
      try {
        if (!dToken) {
          console.error("Doctor token is missing");
          return;
        }
    
        const response = await axios.post(
          `${backendUrl}/api/doctor/appointments`,
          {},
          { headers: { Authorization: `Bearer ${dToken}` } }  // ✅ Include Bearer token
        );
    
        if (response.data.success) {
          setAppointments(response.data.appointments);
        } else {
          console.error("Failed to fetch appointments:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching doctor appointments:", error);
      }
    };
    

    const value = {
        dToken,setDToken,
        backendUrl,appointments,
        getAppointments,
        setAppointments,
    }

return (
    <DoctorContext. Provider value={value}>
        {props.children}
        </DoctorContext. Provider>
)
}

export default DoctorContextProvider