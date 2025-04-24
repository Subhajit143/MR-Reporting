import React, { useEffect, useState } from "react";
import backgr from "../../assets/homedsk1.png";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Navigate, useNavigate } from "react-router-dom";
import { FaPlus, FaSearch } from "react-icons/fa";
import axios from "axios";
import { VisitCard } from "../Card/VisitCard";
const Client = () => {
  const [activeType, setActiveType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [allClients, setAllClients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showPopup,setShowPopup]=useState(false)
  const navigate = useNavigate();

  console.log("All Clients", allClients);

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        "http://192.168.29.113:5000/api/mr/visits",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const doctors = response.data.allAssignedDoctors.map((d) => ({
        ...d,
        visit_type: "doctor",
      }));
      const hospitals = response.data.allAssignedHospitals.map((h) => ({
        ...h,
        visit_type: "hospital",
      }));

      if (activeType === "Doctors") {
        setAllClients(doctors);
      } else if (activeType === "Hospitals") {
        setAllClients(hospitals);
      } else {
        setAllClients([...doctors, ...hospitals]);
      }
    } catch (error) {
      console.error("Error fetching assigned visits:", err);
      setAllAssigned([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [activeType]);

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
          <h1 className="text-xl font-bold text-gray-700">Client's</h1>
        </div>

        <div className="flex flex-col w-full px-6">
          <div className="bg-white font-bold rounded-full flex p-1 shadow-inner max-w-md mx-auto mb-6">
            {["All", "Doctors", "Hospitals"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex-1 py-1 w-25 rounded-full ${
                  activeType === type
                    ? "bg-blue-500 text-white"
                    : "text-blue-500"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

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
              {allClients?.length > 0 ? (
                allClients.map((doctor, index) => (
                  <VisitCard key={index} doctor={doctor} />
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No visits scheduled.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 text-center items-center">
  <button
    onClick={()=>setShowPopup(!showPopup)}
    className="w-16 h-16 bg-green-500 hover:bg-blue-600 text-white text-5xl rounded-full shadow-lg flex items-center  justify-center p-0  font-bold"
  >
    <FaPlus className="text-2xl" />
  </button>
</div>
{
    showPopup && (
        <div onClick={()=>setShowPopup(!showPopup)} className="fixed inset-0 backdrop-blur-xl  flex items-center justify-center z-50">
            <div className="bg-neutral-200 w-[90%] flex justify-center items-center">
                <div className="flex flex-col justify-center gap-5 p-6 items-center text-center">
                    <div>
                        <h1 className="text-xl font-semibold">Which type Client you want to add ?? </h1>
                    </div>

                    <div className="flex flex-col gap-2 font-bold text-white">
                        <div className="bg-green-500 p-1" onClick={()=>navigate("/addDocClient")}><button >Doctor</button></div>
                        <div className="bg-blue-400 p-2" onClick={()=>navigate("/addHosClient")}><button >Hospital Manager</button></div>
                    </div>
                </div>
            </div>

        </div>
    )
}
    </div>
    
  );
};

export default Client;
