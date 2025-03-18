import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react"; 
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import RealeatedDoctors from "../components/RealeatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const {
    doctors,
    currencysymbol,
    backendUrl,
    token,
    getDoctorsData,
    userData, 
  } = useContext(AppContext);
  
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);  // Use null initially
  const [docSlots, setDocSlots] = useState([]);  // Array should be empty initially
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch doctor information from the doctors list
  const fetchDocInfo = async () => {
    if (!doctors.length) await getDoctorsData();
    const doc = doctors.find((doc) => doc._id === docId);
    if (!doc) {
      toast.error("Doctor not found!");
      return;
    }
    setDocInfo(doc);  // Set doctor info
  };

  // Generate available slots for the selected doctor (collect in an array first)
  const getAvailableSlots = async () => {
    if (!docInfo) return;

    let today = new Date();
    let slots = [];
    
    // Fix: `currentDate` initialization
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // Set the end time for appointments (9:00 PM)
      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0);

      // For today, start time should be max(10 AM, one hour after current time if past 10)
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const slotDate = `${currentDate.getDate()}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`;
        const isSlotAvailable = docInfo.slots_booked && !docInfo.slots_booked[slotDate]?.includes(formattedTime);
        
        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      slots.push(timeSlots);
    }
    setDocSlots(slots);
  };

  // Book an appointment
  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Please log in to book an appointment.');
      return navigate('/login');
    }
  
    try {
      const date = docSlots[slotIndex]?.[0]?.datetime;
      
      if (!date) {
        toast.error("Please select a valid appointment slot.");
        return;
      }
  
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      const slotDate = `${day}_${month}_${year}`;
  
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      if (data.success) {
        toast.success(data.message);
        getDoctorsData(); // Refresh doctor data
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };
  
  // Fetch doctor info when component mounts or when doctors/ docId changes
  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  // Get available slots when doctor info is available
  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  // Debug: Log the slots whenever they change
  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  return (
    docInfo && (
      <div>
        {/* Doctor's details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image || assets.default_profile}
              alt={docInfo.name}
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-8-px] sm:mt-0">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="Verified" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="Info" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:
              <span className="text-gray-600">
                {currencysymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length > 0 &&
              docSlots.map((item, index) => (
                <div
                  onClick={() => setSlotIndex(index)}
                  key={index}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border-gray-200'}`}
                >
                  <p>{item?.[0]?.datetime && daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item?.[0]?.datetime && item[0].datetime.getDate()}</p>
                </div>
              ))}
          </div>
          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots[slotIndex]?.length > 0 &&
              docSlots[slotIndex]?.map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  key={index}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <button
            onClick={bookAppointment}
            className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book an appointment'}
          </button>
        </div>

        {/* Listing related doctors */}
        <RealeatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
}

export default Appointment;
