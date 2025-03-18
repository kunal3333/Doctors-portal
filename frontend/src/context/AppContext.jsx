import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => { 
  const CurrencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [userData, setUserData] = useState(null)


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

  const loadUserProfileData = async () => {
    try {
        const token = localStorage.getItem("token"); 
        if (!token) {
            console.error("No token found. User is not authenticated.");
            return;
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, config);
        console.log("User Profile Data:", data);
        if (data.success) {
            setUserData(data.user);  // ✅ Use `setUserData`, not `setUserProfile`
        } else {
            console.error("API returned an error:", data);
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }

};


  const value = {
    doctors,getDoctorsData,
    CurrencySymbol,
    loading,
    error, 
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData
  };


  useEffect(() => {
    getDoctorsData();
    console.log("Doctors state after fetch:", doctors);  
}, []);


useEffect(() => {
  loadUserProfileData();
}, []);


  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
