import { useContext, useState } from "react";
import axios from "axios"; 
import { AppContext } from "../context/AppContext.jsx"; 
import { assets } from '../assets/assets_frontend/assets.js';

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
  
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState(userData);

  const handleCancelEdit = () => {
    setIsEdit(false);
    setFormData(userData);
    setImage(null);
  };

  const updateUserProfileData = async () => {
    if (!token) {
      console.error("No authentication token found.");
      return;
    }

    try {
      const form = new FormData();
      form.append("name", formData.name || "");
      form.append("phone", formData.phone || "");
      form.append("gender", formData.gender || "");
      form.append("dob", formData.dob || "");
      form.append("address", JSON.stringify(formData.address || {}));
      if (image) form.append("docImg", image);

      const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        setUserData(data.user);
        setIsEdit(false);
        setImage(null);
        loadUserProfileData();
      } else {
        console.log("Update Failed:", data.message);
      }
    } catch (error) {
      console.log("Error updating profile:", error);
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      {isEdit ? (
        <label htmlFor="image">
          <div className="inline-block relative cursor-pointer">
            <img
              className="w-36 rounded opacity-75"
              src={image ? URL.createObjectURL(image) : userData?.image || assets.default_profile}
              alt="Profile"
            />
            <img className="w-10 absolute bottom-12 right-12" src={!image ? assets.upload_icon : ""} alt="Upload Icon" />
          </div>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
        </label>
      ) : (
        userData?.image && <img className="w-36 h-36 rounded-full" src={userData.image} alt="Profile" />
      )}

      {isEdit ? (
        <input
          className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
          type="text"
          value={formData?.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">{userData?.name}</p>
      )}

      <hr className="bg-zinc-400 h-[1px] border-none" />

      <div>
        <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Email id:</p>
          <p className="text-blue-500">{userData?.email || "N/A"}</p>

          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={formData?.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          ) : (
            <p className="text-blue-400">{userData?.phone || "N/A"}</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-neutral-500 underline mt-3">ADDRESS</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Line 1:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={formData?.address?.line1 || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: { ...formData.address, line1: e.target.value } })
              }
            />
          ) : (
            <p>{userData?.address?.line1 || "N/A"}</p>
          )}

          <p className="font-medium">City:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={formData?.address?.city || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })
              }
            />
          ) : (
            <p>{userData?.address?.city || "N/A"}</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Gender:</p>
          <p>{userData?.gender || "Not Specified"}</p>

          <p className="font-medium">Birthday:</p>
          <p>{userData?.dob || "Not Specified"}</p>
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        {isEdit ? (
          <>
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={updateUserProfileData}
            >
              Save Information
            </button>
            <button
              className="border border-red-500 text-red-500 px-8 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            onClick={() => {
              setIsEdit(true);
              setFormData(userData);
            }}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
