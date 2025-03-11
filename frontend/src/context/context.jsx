import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const Appcontext = createContext();

const AppContextProvider = ({ children }) => { // Using destructuring to extract children from props
  const CurrencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state

  const value = {
    doctors,
    CurrencySymbol,
    loading,
    error, // Added error to context value
  };

  const getDoctorsData = async () => {
    try {
      setLoading(true); 
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      
      console.log("API Response:", data);

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        console.error("API returned an error:", data);
        setError("Failed to fetch doctors.");
        toast.error("Failed to fetch doctors.");
      }
    } catch (error) {
      console.error("API Call Failed:", error);
      setError("An error occurred while fetching data.");
      toast.error("An error occurred while fetching data.");
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    getDoctorsData();
    console.log("Doctors state after fetch:", doctors);  
}, []);

  return (
    <Appcontext.Provider value={value}>
      {children}
    </Appcontext.Provider>
  );
};

export default AppContextProvider;
