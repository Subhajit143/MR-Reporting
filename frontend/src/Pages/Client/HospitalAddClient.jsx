import React, { useState } from "react";
import backgr from "../../assets/homedsk1.png";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoPerson } from "react-icons/io5";
import { PiGenderIntersexBold } from "react-icons/pi";
import { FaHospital, FaMapMarkerAlt, FaPhone, FaEnvelope, FaFilePdf, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

const HospitalAddClient = () => {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState("basic");
  const [formData, setFormData] = useState({
    name: "" ,
    position: "",
    hospital_name: "",
    hospital_address: "",
    latitude: "",
    longitude: "",
    profile_img: null,
    pdf: null,
    contact_number: "",
    email: "",
    gender: "Male"
  });

  console.log("formdata",formData);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = (e) => {
    for (const [key, value] of Object.entries(formData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        alert(`Please fill in the ${key.replace("_", " ")} field.`);
        return;
      }
    }
  
    console.log("Form submitted:", formData);
  };

  return (
    <div
      className="w-full min-h-screen bg-no-repeat bg-top bg-contain flex"
      style={{ backgroundImage: `url(${backgr})` }}
    >
      <div className="flex flex-col h-screen w-full">
        <div className="flex items-center gap-4 p-4">
          <IoMdArrowRoundBack
            size={24}
            onClick={() => navigate(-1)}
            className="cursor-pointer"
          />
          <h1 className="text-xl font-bold text-gray-700">
            Add Hospital Manager
          </h1>
        </div>

        <div className="flex flex-col w-full px-6">
          <div className="bg-white font-bold rounded-full flex p-1 shadow-inner max-w-md mx-auto mb-6">
            {[
              { id: "basic", label: "Basic Info" },
              { id: "location", label: "Location" },
              { id: "attachment", label: "Attachment" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex-1 py-1 w-25 rounded-full ${
                  activeType === type.id
                    ? "bg-blue-500 text-white"
                    : "text-blue-500"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 overflow-y-auto flex-1 pb-20">
          {/* Basic Info Section */}
          {activeType === "basic" && (
            <div className="space-y-4">
              <div className="flex items-center w-full py-3 rounded-2xl border border-gray-300 bg-gray-100 px-4">
                <div className="pr-3 border-r border-gray-300">
                  <IoPerson size={20} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Manager name"
                  className="ml-3 bg-transparent outline-none w-full placeholder-gray-500"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center w-full py-3 rounded-2xl border border-gray-300 bg-gray-100 px-4">
                <div className="pr-3 border-r border-gray-300">
                  <IoPerson size={20} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="position"
                  placeholder="Enter Position"
                  className="ml-3 bg-transparent outline-none w-full placeholder-gray-500"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center w-full py-3 rounded-2xl border border-gray-300 bg-gray-100 px-4">
                <div className="pr-3 border-r border-gray-300">
                  <FaHospital size={20} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="hospital_name"
                  placeholder="Enter Hospital Name"
                  className="ml-3 bg-transparent outline-none w-full placeholder-gray-500"
                  value={formData.hospital_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center w-full py-3 rounded-2xl border border-gray-300 bg-gray-100 px-4">
                <div className="pr-3 border-r border-gray-300">
                  <PiGenderIntersexBold size={20} className="text-gray-500" />
                </div>
                <select 
                  name="gender"
                  className="ml-3 bg-transparent outline-none w-full placeholder-gray-500"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center w-full py-3 rounded-2xl border border-gray-300 bg-gray-100 px-4">
                <div className="pr-3 border-r border-gray-300">
                  <FaPhone size={20} className="text-gray-500" />
                </div>
                <input
                  type="tel"
                  name="contact_number"
                  placeholder="Enter Contact Number"
                  className="ml-3 bg-transparent outline-none w-full placeholder-gray-500"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center w-full py-3 rounded-2xl border border-gray-300 bg-gray-100 px-4">
                <div className="pr-3 border-r border-gray-300">
                  <FaEnvelope size={20} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email Address"
                  className="ml-3 bg-transparent outline-none w-full placeholder-gray-500"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Submit Button (fixed at bottom) */}
          <div className="fixed bottom-0  w-full left-0 items-end flex justify-end bg-white p-4 shadow-md">
            <button
              type="submit"
              className="flex items-center justify-center gap-1  text-center  bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <h1 className="font-semibold text-lg items-center text-center">Save & Next</h1>  <span><IoIosArrowForward className="items-center text-center pt-[3px]" size={25}/></span>
            </button>
          </div>
            </div>
            
          )}

          {/* Location Section */}
          {activeType === "location" && (
            <div className="space-y-4">
              <div className="flex items-center w-full py-3 rounded-2xl border border-gray-300 bg-gray-100 px-4">
                <div className="pr-3 border-r border-gray-300">
                  <FaMapMarkerAlt size={20} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="hospital_address"
                  placeholder="Enter Hospital Address"
                  className="ml-3 bg-transparent outline-none w-full placeholder-gray-500"
                  value={formData.hospital_address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center w-full py-3 rounded-2xl border border-gray-300 bg-gray-100 px-4">
                  <input
                    type="text"
                    name="latitude"
                    placeholder="Latitude"
                    className="bg-transparent outline-none w-full placeholder-gray-500"
                    value={formData.latitude}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex items-center w-full py-3 rounded-2xl border border-gray-300 bg-gray-100 px-4">
                  <input
                    type="text"
                    name="longitude"
                    placeholder="Longitude"
                    className="bg-transparent outline-none w-full placeholder-gray-500"
                    value={formData.longitude}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Note: You can use Google Maps to find latitude and longitude</p>
                <button
                  type="button"
                  className="text-blue-500 text-sm underline"
                  onClick={() => window.open("https://www.google.com/maps", "_blank")}
                >
                  Open Google Maps
                </button>
              </div>
            </div>
          )}

          {/* Attachment Section */}
          {activeType === "attachment" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUserCircle className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        {formData.profile_img ? (
                          <span className="font-semibold">{formData.profile_img.name}</span>
                        ) : (
                          <>
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      name="profile_img"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">PDF Document</label>
                <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaFilePdf className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        {formData.pdf ? (
                          <span className="font-semibold">{formData.pdf.name}</span>
                        ) : (
                          <>
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">PDF (Max 10MB)</p>
                    </div>
                    <input
                      type="file"
                      name="pdf"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
              {/* Submit Button (fixed at bottom) */}
          <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Hospital Manager
            </button>
          </div>
            </div>
          )}

          
        </form>
      </div>
    </div>
  );
};

export default HospitalAddClient;