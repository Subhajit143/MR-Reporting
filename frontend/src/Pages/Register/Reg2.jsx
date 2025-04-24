import React, { useState } from "react";
import backgr from "../../assets/dsk4.png";
import logo from "../../assets/logo-vr-removebg-preview.png";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const RegisterOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    email: "",
    dob: "",
    area: "",
    designation: "",
    password: ""
  });

  const location = useLocation();
  const navigate = useNavigate();
  const phone_number = location.state?.phone_number;

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      alert("Enter full 6-digit OTP");
      return;
    }

    try {
      const response = await axios.post(
        "http://192.168.29.113:5000/api/auth/register/verify-otp-and-register",
        { ...formData, otp: otpValue },
        {
          headers: {
            "x-phone-number": phone_number
          }
        }
      );
      alert("Registration Successful");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-no-repeat bg-bottom bg-contain flex items-center justify-center"
      style={{ backgroundImage: `url(${backgr})` }}
    >
      <div className="flex flex-col justify-between items-center text-center h-screen py-10">
        <div className="flex flex-col justify-between h-[90%]  px-4">
          <img src={logo} alt="Logo" width={"290px"} className="mx-auto" />
          <h1 className="text-2xl font-bold pb-4 text-[#0C4AB2]">REGISTER</h1>
          <p className="text-orange-500 font-semibold mb-4">
            OTP sent to {phone_number}
          </p>

          <div className="flex gap-2 justify-center mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                className="w-10 h-12 text-center border border-neutral-400 rounded bg-gray-200 text-xl"
              />
            ))}
          </div>

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <input
            type="date"
            name="dob"
            placeholder="DOB"
            value={formData.dob}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="area"
            placeholder="Area"
            value={formData.area}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="designation"
            placeholder="Designation"
            value={formData.designation}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <button
            onClick={handleRegister}
            className="text-white w-full font-bold px-6 py-3 bg-[#FF8C4C] rounded-4xl"
          >
            REGISTER
          </button>
          <div className="flex text-[#0C4AB2] font-bold text-sm py-2 justify-between">
                  <button onClick={()=>navigate("/")}>Already Have an Account ?</button>

                  
                </div>

          <div className="mt-3 flex flex-col items-center text-sm">
            <button className="underline">Privacy Policy</button>
            <button className="underline">Support: 8420204635</button>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-600">
          <p>Version 1.0.0</p>
          <p>All rights reserved Baidya Healthcare @2025</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterOtp;
