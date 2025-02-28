import { useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from 'react-toastify';
import { assets } from "../../assets/assets";
import axios from 'axios'
const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { backendUrl, aToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!docImg) {
        return toast.error('Image Not selected');
      }

      const formData = new FormData();
      formData.append('docImg', docImg);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('experience', experience);
      formData.append('fees', fees);
      formData.append('about', about);
      formData.append('speciality', speciality);
      formData.append('degree', degree);
      formData.append('address1', address1);
      formData.append('address2', address2);

      formData.forEach((value,key) =>{
        console.log(`${key} : ${value}`); 
      })

      const {data} = await axios.post(backendUrl + '/api/admin/add-doctor',formData,{headers: {aToken} })

      if (data.success) {
        toast.success("Doctor added successfully");
        // Reset the form fields after submission
        setName("");
        setEmail("");
        setPassword("");
        setExperience("");
        setFees("");
        setAbout("");
        setSpeciality("");
        setDegree("");
        setAddress1("");
        setAddress2("");
        setDocImg(false); 
      } else {
        toast.error("Failed to add doctor");
      }
    } catch (error) {
      toast.error("An error occurred while adding the doctor");
      console.error(error);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white px-8 py-8 border w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            {/* to display image  */}
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Upload doctor"
            />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
          <p>
            Upload doctor <br /> picture
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-gray-600">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p>Doctor Name</p>
              <input className="border rounded px-3 py-2" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1">
              <p>Doctor Email</p>
              <input className="border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1">
              <p>Doctor Password</p>
              <input className="border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1">
              <p>Experience</p>
              <select className="border rounded px-3 py-2" value={experience} onChange={(e) => setExperience(e.target.value)}>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={`${i + 1} year`}>{`${i + 1} Year`}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <p>Fees</p>
              <input className="border rounded px-3 py-2" type="number" placeholder="Fees" value={fees} onChange={(e) => setFees(e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p>Speciality</p>
              <select className="border rounded px-3 py-2" value={speciality} onChange={(e) => setSpeciality(e.target.value)}>
                {["General physician", "Gynecologist", "Dermatologist", "Pediatricians", "Neurologist", "Gastroenterologist"].map((speciality, index) => (
                  <option key={index} value={speciality}>{speciality}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <p>Education</p>
              <input className="border rounded px-3 py-2" type="text" placeholder="Education" value={degree} onChange={(e) => setDegree(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1">
              <p>Address</p>
              <input className="border rounded px-3 py-2" type="text" placeholder="Address 1" value={address1} onChange={(e) => setAddress1(e.target.value)} required />
              <input className="border rounded px-3 py-2" type="text" placeholder="Address 2" value={address2} onChange={(e) => setAddress2(e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p>About Doctor</p>
          <textarea
            className="border rounded px-3 py-2 w-full"
            placeholder="Write about doctor"
            rows={5}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            required
          />
        </div>

        <button type='submit' className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Add Doctor</button>
      </div>
    </form>
  );
};

export default AddDoctor;
