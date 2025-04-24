import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import backgr from "../../assets/homedsk1.png";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ChangeMapCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

// Haversine distance calculation function
function haversine(coords1, coords2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // convert to meters
}

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [todaysVisit, setTodaysVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetingTimes, setMeetingTimes] = useState([]);
  const [mapPosition, setMapPosition] = useState(null);
  const [activeTab, setActiveTab] = useState('Basic');
  const [currentTime, setCurrentTime] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isMarkingVisit, setIsMarkingVisit] = useState(false);
  const [isMarkingNotVisit, setIsMarkingNotVisit] = useState(false);
  const [showDistanceWarning, setShowDistanceWarning] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState({
    distance: null,
    doctorAddress: null,
    userAddress: null
  });

  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setCurrentTime(formattedTime);
  }, []);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://192.168.29.113:5000/api/doctor/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setDoctor(res.data);

        if (res.data.latitude && res.data.longitude) {
          setMapPosition([parseFloat(res.data.latitude), parseFloat(res.data.longitude)]);
        }

        const todayRes = await axios.get('http://192.168.29.113:5000/api/mr/visits/today-status', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const todaysVisit = todayRes.data.todayVisits?.find(
          visit => visit.doctor_id === parseInt(id)
        );
        setTodaysVisit(todaysVisit);

        const visitsRes = await axios.get('http://192.168.29.113:5000/api/mr/visits', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const doctorVisits = visitsRes.data.allAssignedDoctors.filter(
          visit => visit.id === parseInt(id)
        );
        setMeetingTimes(doctorVisits);

      } catch (err) {
        console.error("Error fetching doctor details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const formatTime = (time) => {
    if (!time) return "--:--";
    if (time.includes(':')) {
      const parts = time.split(':');
      let hours = parseInt(parts[0]);
      const minutes = parts[1].split(' ')[0];
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${period}`;
    }
    return time;
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  };

  const handleMarkVisited = async () => {
    try {
      setIsMarkingVisit(true);
      
      // Get user's current location
      const location = await getUserLocation();
      setUserLocation(location);
      
      // Calculate distance between user and doctor
      const doctorCoords = {
        lat: parseFloat(doctor.latitude),
        lng: parseFloat(doctor.longitude)
      };
      
      const userCoords = {
        lat: location.lat,
        lng: location.lng
      };
      
      const distance = haversine(userCoords, doctorCoords);
      
      if (distance > 200) {
        // Show warning popup if distance is more than 200m
        setDistanceInfo({
          distance: (distance / 1000).toFixed(2),
          doctorAddress: doctor.address,
          userAddress: "Your current location"
        });
        setShowDistanceWarning(true);
        setIsMarkingVisit(false);
        return;
      }
      
      // Continue with marking visit if within range
      const response = await axios.post(
        `http://192.168.29.113:5000/api/mr/visits/${todaysVisit.visit_log_id}/visited`,
        {
          mr_lat: location.lat,
          mr_lng: location.lng
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Refresh the visit status
      const todayRes = await axios.get('http://192.168.29.113:5000/api/mr/visits/today-status', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const updatedVisit = todayRes.data.todayVisits?.find(
        visit => visit.doctor_id === parseInt(id)
      );
      setTodaysVisit(updatedVisit);

      alert(response.data.message || "Visit marked successfully!");
    } catch (error) {
      console.error("Error marking visit:", error);
      if (error.response) {
        alert(error.response.data.message || "Failed to mark visit");
      } else {
        alert(error.message || "Failed to get your location");
      }
    } finally {
      setIsMarkingVisit(false);
    }
  };

  const handleForceCheckIn = async () => {
    try {
      setIsMarkingVisit(true);
      setShowDistanceWarning(false);
      
      const location = userLocation || await getUserLocation();
      
      const response = await axios.post(
        `http://192.168.29.113:5000/api/mr/visits/${todaysVisit.visit_log_id}/visited`,
        {
          mr_lat: location.lat,
          mr_lng: location.lng
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const todayRes = await axios.get('http://192.168.29.113:5000/api/mr/visits/today-status', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const updatedVisit = todayRes.data.todayVisits?.find(
        visit => visit.doctor_id === parseInt(id)
      );
      setTodaysVisit(updatedVisit);

      alert(response.data.message || "Visit marked successfully!");
    } catch (error) {
      console.error("Error marking visit:", error);
      alert(error.response?.data?.message || "Failed to mark visit");
    } finally {
      setIsMarkingVisit(false);
    }
  };

  const handleMarkNotVisited = async () => {
    try {
      setIsMarkingNotVisit(true);
      
      const response = await axios.post(
        `http://192.168.29.113:5000/api/mr/visits/${todaysVisit.visit_log_id}/not-visited`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const todayRes = await axios.get('http://192.168.29.113:5000/api/mr/visits/today-status', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const updatedVisit = todayRes.data.todayVisits?.find(
        visit => visit.doctor_id === parseInt(id)
      );
      setTodaysVisit(updatedVisit);

      alert(response.data.message || "Visit marked as not visited");
    } catch (error) {
      console.error("Error marking not visited:", error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "Failed to mark as not visited";
      alert(errorMsg);
      
      try {
        const todayRes = await axios.get('http://192.168.29.113:5000/api/mr/visits/today-status', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const updatedVisit = todayRes.data.todayVisits?.find(
          visit => visit.doctor_id === parseInt(id)
        );
        setTodaysVisit(updatedVisit);
      } catch (refreshError) {
        console.error("Error refreshing visit status:", refreshError);
      }
    } finally {
      setIsMarkingNotVisit(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading doctor details...</p>;
  }

  if (!doctor) {
    return <p className="p-6">Doctor not found</p>;
  }

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
          <h1 className="text-xl font-bold text-gray-700">Visit Doctor</h1>
        </div>

        <div className="flex justify-center gap-4 px-6 py-2 font-semibold text-[#3463BA] mt-1 mb-8">
          {["Basic", "Schedules"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative w-[50%]"
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-[#3463BA] w-full"></span>
              )}
            </button>
          ))}
        </div>

        <div className="px-6 space-y-2 flex flex-col gap-3 overflow-y-auto pb-6">
          {activeTab === 'Basic' ? (
            <>
              <div className="flex w-screen gap-5 items-center justify-between">
                <div>
                <img 
                  src={doctor.profile_img} 
                  className='w-30 h-30 rounded-full object-cover ' 
                  alt="Doctor_img" 
                />
                </div>
               <div>
               <h2 className="text-3xl font-bold text-gray-700">{doctor.name}</h2>
               </div>
              </div>

              <div className='flex flex-col gap-2 text-sm font-semibold'>
                <p className="text-gray-600 flex justify-between">
                  <span className='font-bold text-[#3866BD]'>Designation:</span>  
                  {doctor.designation || "Not specified"}
                </p>
                <p className="text-gray-600 flex justify-between">
                  <span className='font-bold text-[#3866BD]'>Clinic:</span> 
                  {doctor.hospital_or_clinic || "Not specified"}
                </p>
                <p className="text-gray-600 flex justify-between">
                  <span className='font-bold text-[#3866BD]'>Email:</span> 
                  {doctor.email || "Not specified"}
                </p>
                <p className="text-gray-600 flex justify-between">
                  <span className='font-bold text-[#3866BD]'>Phone:</span> 
                  {doctor.phone_number || "Not specified"}
                </p>
                <p className="text-gray-600 flex justify-between">
                  <span className='font-bold text-[#3866BD]'>Date Of Birth:</span> 
                  {doctor.dob || "Not specified"}
                </p>
                <p className="text-gray-600 flex justify-between">
                  <span className='font-bold text-[#3866BD]'>Address:</span> 
                  {doctor.address || "Not specified"}
                </p>
              </div>

              {mapPosition && (
                <div className="bg-white rounded-lg h-50 z-10">
                  <h3 className="font-bold text-gray-700 mb-2">Location</h3>
                  <MapContainer
                    center={mapPosition}
                    zoom={15}
                    style={{ height: '150px', width: '100%', borderRadius: '0.5rem' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={mapPosition} />
                    <ChangeMapCenter position={mapPosition} />
                  </MapContainer>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-700 mb-3">Meeting Schedule</h2>
              
              {todaysVisit && (
                <div className="mb-4">
                  <h3 className="font-semibold text-blue-600">Today's Meeting:</h3>
                  <p className="text-lg">{formatTime(todaysVisit.visit_time)}</p>
                  <p className={`text-sm ${
                    todaysVisit.status === 'Visited' ? 'text-green-500' :
                    todaysVisit.status === 'Not Visited' ? 'text-red-500' : 
                    'text-yellow-500'}`}>
                    Status: {todaysVisit.status || 'Pending'}
                  </p>
                </div>
              )}
              
              {meetingTimes.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-blue-600 mb-2">All Scheduled Visits:</h3>
                  <div className="space-y-2">
                    {meetingTimes.map((visit, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{visit.visit_day}</span>
                        <span className="text-gray-700">{formatTime(visit.visit_time)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No scheduled visits found</p>
              )}
            </div>
          )}

          <div className='items-center flex justify-center font-bold text-red-600 shadow-2xl underline'>
            <a href="">Download LBL PDF </a>
          </div>

          {todaysVisit && todaysVisit.status === 'Pending' ? (
            <div className="sticky font-semibold flex flex-col justify-center items-center gap-3">
              <div>
                <button 
                  className="bg-red-500 text-white w-80 p-3"
                  onClick={handleMarkNotVisited}
                  disabled={isMarkingNotVisit}
                >
                  {isMarkingNotVisit ? "Processing..." : "NOT VISITED"}
                </button>
              </div>
              <div>
                <button 
                  className="bg-blue-500 text-white w-80 p-1 flex flex-col items-center px-1"
                  onClick={handleMarkVisited}
                  disabled={isMarkingVisit}
                >
                  {isMarkingVisit ? "Processing..." : "VISIT"}
                  <span className="text-xs ml-1">{currentTime}</span>
                </button>
              </div>
            </div>
          ):(
            <>
            <div className='flex items-center justify-center pt-6'>
                <button 
                  className="bg-neutral-400 text-white w-80 p-1 flex flex-col items-center px-1"
                  
                  
                >
                  {isMarkingVisit ? "Processing..." : "ALREADY SUBMITED"}
                  <span className="text-xs ml-1">{currentTime}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Distance Warning Modal */}
      {showDistanceWarning && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center  p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-red-600 mb-4">
              WARNING: You are not within the doctor's premises
            </h3>
            <p className="mb-2">Your location will not be recorded properly.</p>
            
            <div className="mb-4">
              <p className="font-semibold">Distance to doctor's clinic: {distanceInfo.distance} KM</p>
              <p className="text-sm text-gray-600 mt-2">
                Doctor's address: {distanceInfo.doctorAddress}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowDistanceWarning(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                TRY AGAIN
              </button>
              <button 
                onClick={() => {
                  setShowDistanceWarning(false);
                  // You could implement a function to show doctor's address details here
                }}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                REVIEW DR. ADDRESS
              </button>
              <button 
                onClick={handleForceCheckIn}
                className="bg-red-500 text-white py-2 px-4 rounded"
                disabled={isMarkingVisit}
              >
                {isMarkingVisit ? "CHECKING IN..." : "CHECK-IN ANYWAYS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;