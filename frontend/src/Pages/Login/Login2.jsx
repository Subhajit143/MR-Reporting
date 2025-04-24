import React, { useState } from "react";
import backgr from "../../assets/dsk4.png";
import logo from "../../assets/logo-vr-removebg-preview.png";
import { Phone, Lock } from "lucide-react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Login2 = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const location = useLocation();
  const navigate = useNavigate();

  const phone_number = location.state?.phone_number;

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Move to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };
  const handleLogin = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      alert("Please enter 6-digit OTP");
      return;
    }

    try {
      const res = await axios.post(
        "http://192.168.29.113:5000/api/auth/login/verify",
        { otp: otpValue },
        {
          headers: {
            "x-phone-number": phone_number
          }
        }
      );
      console.log(res.data);
      localStorage.setItem("token", res.data.token);
      alert("Login Successful!");
      navigate("/home")
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "OTP Verification failed");
    }
  };
  return (
    <>
      <div
        className="w-full min-h-screen bg-no-repeat bg-bottom bg-contain flex items-center justify-center"
        style={{ backgroundImage: `url(${backgr})` }}
      >
        <div className="flex flex-col justify-between items-center text-center h-screen py-10">
          <div className="flex flex-col justify-between h-[70%]">
            <div className="flex flex-col gap-5">
              <div>
                <img src={logo} alt="Logo" width={"290px"} />
              </div>
              <div className="flex flex-col ">
                <h1 className="text-2xl font-bold pb-5 text-[#0C4AB2]">
                  OTP VARIFICATION
                </h1>
                <p className="text-orange-500 font-semibold mb-4">
                  We’ve Sent An OTP To {phone_number}
                </p>

                <div className="flex gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(e, index)}
                      className="w-10 h-12 text-center border border-neutral-400 rounded bg-gray-200 text-xl"
                    />
                  ))}
                </div>

                <div className="text-sm flex pt-2">
                <button >Resende OTP </button>
                </div>
              </div>
              <div>
                <button
                  onClick={handleLogin}
                  className=" text-white w-full font-bold px-6 py-3 bg-[#FF8C4C] rounded-4xl"
                >
                  VARIFY OTP
                </button>

                <div className="flex text-[#0C4AB2] font-bold text-sm py-2 justify-center">
                  <button onClick={()=>navigate("/register")}>SignUp</button>

                  
                </div>
              </div>
            </div>

            <div className="flex flex-col ">
              <button className="text-sm underline">Privacy Policy</button>
              <button className="text-sm underline">Support: 8420204635</button>
            </div>
          </div>

          <div className="mt-10 text-xs text-gray-600">
            <p>Version 1.0.0</p>
            <p>All rights reserved Baidya Healthcare @2025</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login2;
