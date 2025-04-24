import React, { useState } from "react";
import backgr from "../../assets/dsk4.png";
import logo from "../../assets/logo-vr-removebg-preview.png";
import { Phone, Lock } from "lucide-react";
import axios from "axios";
import {useNavigate} from "react-router-dom"

const Login1 = () => {
  const [phone,setPhone]=useState("")
  const [password,setPassword]=useState("")
  const navigate= useNavigate()

  const handleLogin=async()=>{
    if(!phone || !password){
      alert("Please Enter Phone number and password")
      return
    }

    try {
      const response = await axios.post("http://192.168.29.113:5000/api/auth/login",{
        phone_number :phone,
        password
      })
      console.log(response.data);
      navigate("/otp-login",{state: {phone_number:phone}})
      
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login failed")
      
    }
  }
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
                <h1 className="text-2xl font-bold pb-5 text-[#0C4AB2]">LOGIN</h1>

                <div className="flex items-center w-full py-3 rounded-full border border-gray-300 bg-gray-100 px-4">
                  <div className="pr-3 border-r border-gray-300">
                    <Phone size={20} className="text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter Your Phone Number"
                    className="ml-3 bg-transparent outline-none w-full placeholder-gray-500"
                    value={phone}
                    onChange={(e)=>setPhone(e.target.value)}
                  />
                </div>

                <div className="flex items-center w-full py-3 rounded-full border border-gray-300 bg-gray-100 px-4 mt-4">
                  <div className="pr-3 border-r border-gray-300">
                    <Lock size={20} className="text-gray-500" />
                  </div>
                  <input
                    type="password"
                    placeholder="Enter Your Password"
                    className="ml-3 bg-transparent outline-none w-full placeholder-gray-500"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <button onClick={handleLogin} className=" text-white w-full font-bold px-6 py-3 bg-[#FF8C4C] rounded-4xl">
                  LOGIN
                </button>
                <div className="flex text-[#0C4AB2] font-bold text-sm py-2 justify-between">
                  <button onClick={()=>navigate("/register")}>SignUp</button>

                  <button>Forget Password ?</button>
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

export default Login1;
