import { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';  // Ensure this import is correct
import { AppContext } from '../../context/AppContext';

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, updateDoctorProfile,backendUrl } = useContext(DoctorContext); // updateDoctorProfile should come from DoctorContext
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState('');

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
      };
 
      console.log("Sending Update Request:", updateData); // ✅ Debugging

      const response = await updateDoctorProfile(updateData); // Call updateDoctorProfile here
      if (response.success) {
        setIsEdit(false); // Disable edit mode after successful update
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  useEffect(() => {
    if (dToken && !profileData) {
      getProfileData().catch((err) => {
        setError('Failed to load profile data. Please try again later.');
        console.error('Error fetching profile data:', err);
      });
    }
  }, [dToken, profileData, getProfileData]);

  return (
    <div>
      {error && <div className="error-message text-red-500">{error}</div>}

      {profileData && (
        <div className="flex flex-col gap-4 m-5">
          <div>
            <img className="bg-green-500/80 w-full sm:max-w-64 rounded-lg" src={profileData.image} alt="Profile" />
          </div>
          <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
            <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">{profileData.name}</p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>{profileData.degree} - {profileData.speciality}</p>
              <button className="py-0.5 px-2 border text-xs rounded-full">{profileData.experience} years</button>
            </div>

            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-8">About:</p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">{profileData.about}</p>
            </div>

            <p className="text-gray-600 font-medium mt-4">Appointment Fee:
              <span className="text-gray-800">
                {currency}
                {isEdit ?
                  <input
                    type="number"
                    onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                    value={profileData.fees}
                    className="border rounded px-2 py-1 ml-2"
                  />
                  : profileData.fees}
              </span>
            </p>

            <div className="flex gap-2 py-2">
              <p>Address</p>
              <p className="text-sm">
                {isEdit ?
                  <input
                    type="text"
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                    value={profileData.address.line1}
                    className="border rounded px-2 py-1 mb-2"
                  />
                  : profileData.address.line1}
                <br />
                {isEdit ?
                  <input
                    type="text"
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                    value={profileData.address.line2}
                    className="border rounded px-2 py-1"
                  />
                  : profileData.address.line2}
              </p>
            </div>

            <div className="flex gap-1 pt-2">
              <input
                onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                checked={profileData.available}
                type="checkbox"
                id="available"
              />
              <label htmlFor="available">Available</label>
            </div>

            {
              isEdit
                ? <button onClick={updateProfile} className="px-4 py-1 border border-green text-sm rounded-full mt-5 hover:bg-green-500 hover:text-white transition-all">
                  Save
                </button>
                : <button onClick={() => setIsEdit(true)} className="px-4 py-1 border border-green text-sm rounded-full mt-5 hover:bg-green-500 hover:text-white transition-all">
                  Edit
                </button>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
