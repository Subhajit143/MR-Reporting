import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import backgr from "../../assets/homedsk1.png";



// VisitCard Component


export const VisitCard = ({ doctor }) => {
    const navigate = useNavigate();
    const speciality = doctor.speciality || doctor.position || "General";
    const address = doctor.address || doctor.hospital_address || "No address provided";
    
    const getStatusColor = (status) => {
      switch (status) {
        case "Visited":
          return "text-green-500";
        case "Not Visited":
          return "text-red-500";
        default:
          return "text-yellow-500";
      }
    };
  
    const handleClick = () => {
      // Determine the correct ID field
      const doctorId = doctor.doctor_id || doctor.id;
      
      // Prepare consistent doctor data
      const doctorData = {
        id: doctorId,
        name: doctor.name,
        speciality: doctor.speciality,
        address: doctor.address,
        status: doctor.status, // Only exists in today-status response
        visit_time: doctor.visit_time // Format may differ between endpoints
      };
      
      navigate(`/doctor/${doctorId}`, { state: { doctor: doctorData } });
    };
  
    // Format time consistently (handle both "11:00 AM" and "11:00:00" formats)
    const formatTime = (time) => {
      if (!time) return "--:--";
      
      // If time is in "HH:MM:SS" format
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':');
        const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
        const displayHours = parseInt(hours) % 12 || 12;
        return `${displayHours}:${minutes} ${period}`;
      }
      
      return time;
    };
  
    return (
      <div 
        onClick={handleClick}
        className="bg-neutral-50 border border-neutral-200 rounded-2xl shadow-md p-4 mb-2 flex items-center justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full " >
          <img src={doctor.profile_img} alt="" className="w-13 h-13 rounded-full border-2 border-neutral-300 object-cover" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{doctor.name || "Unknown"}</h3>
            <p className="text-xs text-gray-500">{doctor.speciality || "General"}</p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <FaMapMarkerAlt className="mr-1 text-red-400" />
              <span>{doctor.address || "No address provided"}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {doctor.visit_time ? (
              <>
                <span className="text-xl">{formatTime(doctor.visit_time).split(" ")[0]}</span>
                <span className="text-xs ml-1">{formatTime(doctor.visit_time).split(" ")[1]}</span>
              </>
            ) : (
              "--:--"
            )}
          </p>
          {doctor.status && (
            <p className={`text-xs ${getStatusColor(doctor.status)}`}>
              {doctor.status}
            </p>
          )}
        </div>
      </div>
    );
  };