import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import backgr from "../../assets/homedsk1.png";
import { VisitCard } from "../Card/VisitCard";



// Visits Component
const Visits = () => {
  const [todayVisit, setTodayVisit] = useState([]);
  const [allAssigned, setAllAssigned] = useState([]);
  const [activeDateTab, setActiveDateTab] = useState("Today");
  const [activeTypeTab, setActiveTypeTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const navigate = useNavigate();

  const fetchTodayVisits = async () => {
    try {
      const res = await axios.get("http://192.168.29.113:5000/api/mr/visits/today-status", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Handle both doctors and hospitals
      if (activeTypeTab === "Doctors") {
        setTodayVisit(res.data.todayVisits || []);
      } else if (activeTypeTab === "Hospitals") {
        setTodayVisit(res.data.todayHospitalVisits || []);
      } else {
        // Combine both for "All" tab
        setTodayVisit([
          ...(res.data.todayVisits || []).map(v => ({ ...v, visit_type: "doctor" })),
          ...(res.data.todayHospitalVisits || []).map(v => ({ ...v, visit_type: "hospital" }))
        ]);
      }
    } catch (err) {
      console.error("Error fetching today visits:", err);
    }
  };

  const fetchAllAssignedDoctors = async () => {
    try {
      const res = await axios.get("http://192.168.29.113:5000/api/mr/visits", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Add type information to distinguish doctors/hospitals
      const doctors = (res.data.allAssignedDoctors || []).map(d => ({ ...d, type: "doctor" }));
      const hospitals = (res.data.allAssignedHospitals || []).map(h => ({ ...h, type: "hospital" }));

      if (activeTypeTab === "Doctors") {
        setAllAssigned(doctors);
      } else if (activeTypeTab === "Hospitals") {
        setAllAssigned(hospitals);
      } else {
        setAllAssigned([...doctors, ...hospitals]);
      }
    } catch (err) {
      console.error("Error fetching assigned visits:", err);
      setAllAssigned([]);
    }
  };

  useEffect(() => {
    if (activeDateTab === "Today") {
      fetchTodayVisits();
    } else {
      fetchAllAssignedDoctors();
    }
  }, [activeDateTab, activeTypeTab]); // Add dependencies here

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchSearchResults = async () => {
        if (!searchQuery.trim()) {
          setSearchResults([]);
          return;
        }
        try {
          const res = await axios.get(
            `http://192.168.29.113:5000/api/mr/search-doctors?q=${searchQuery}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setSearchResults(res.data || []);
        } catch (error) {
          console.error("Search error:", error);
        }
      };

      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleBack = () => {
    navigate("/home");
  };

  const getFilteredVisits = () => {
    if (searchQuery) return searchResults;
  
    const dataToFilter = activeDateTab === "Today" ? todayVisit : allAssigned;
    
    if (!Array.isArray(dataToFilter)) return [];
  
    if (activeTypeTab === "Doctors") {
      return dataToFilter.filter(d => d.visit_type === "doctor" || d.type === "doctor");
    } else if (activeTypeTab === "Hospitals") {
      return dataToFilter.filter(d => d.visit_type === "hospital" || d.type === "hospital");
    }
    
    return dataToFilter;
  };
  const visitsToShow = getFilteredVisits();

  return (
    <div
      className="w-full min-h-screen bg-no-repeat bg-top bg-contain flex"
      style={{ backgroundImage: `url(${backgr})` }}
    >
      <div className="flex flex-col h-screen w-full">
        {/* Header */}
        <div className="flex items-center gap-4 p-4">
          <IoMdArrowRoundBack
            size={24}
            onClick={handleBack}
            className="cursor-pointer"
          />
          <h1 className="text-xl font-bold text-gray-700">Visits</h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-col w-full px-6">
          {/* Type Tabs */}
          <div className="bg-white font-bold rounded-full flex p-1 shadow-inner max-w-md mx-auto mb-6">
            {["All", "Doctors", "Hospitals"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveTypeTab(type)}
                className={`flex-1 py-1 w-25 rounded-full ${
                  activeTypeTab === type
                    ? "bg-blue-500 text-white"
                    : "text-blue-500"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Date Tabs */}
          <div className="flex justify-center gap-10 font-semibold text-[#3463BA] mt-1 mb-2">
            {["Today", "All"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveDateTab(tab)}
                className="relative w-[50%]"
              >
                {tab}
                {activeDateTab === tab && (
                  <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-[#3463BA] w-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative my-4 max-w-[760px] mx-auto w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctor by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full  px-4 pl-8 py-2 bg-white border border-neutral-300 rounded-4xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Visit Cards */}
          <div className="mt-3 flex-1 overflow-y-auto max-h-[75vh]">
            <div className="grid grid-cols-1 w-full max-w-[760px] mx-auto">
              {visitsToShow?.length > 0 ? (
                visitsToShow.map((doctor, index) => (
                  <VisitCard key={index} doctor={doctor} />
                ))
              ) : (
                <p className="text-center text-gray-500">No visits scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visits;