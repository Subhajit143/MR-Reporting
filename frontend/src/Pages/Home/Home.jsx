// import React, { useEffect, useState } from "react";
// import backgr from "../../assets/homedsk1.png";
// import logo from "../../assets/logo-vr-removebg-preview.png";
// import {
//   Menu,
//   Clock,
//   User,
//   Calendar,
//   FileText,
//   Bell,
//   Shield,
//   Hospital,
// } from "lucide-react";
// import bg from "../../assets/Untitled-28.png";
// import { useNavigate } from "react-router-dom";

// const Home = () => {
//   const navigate = useNavigate();
//   const [time, setTime] = useState(new Date());
//   // const [mainTime, setMainTime] = useState('');
//   // const [period, setPeriod] = useState('');
//   const [showPopup, setShowPopup] = useState(false);
//   const [showPopStop, setShowPopStop] = useState(false);
//   const [workMode, setWorkMode] = useState("");
//   const [route, setRoute] = useState("");
//   const [hasStartedWork, setHasStartedWork] = useState(false);
//   const [loginTime, setLoginTime] = useState(null);
//   const [currentLocation, setCurrentLocation] = useState("");
//   const apiEndpoint = "https://api.opencagedata.com/geocode/v1/json";
//   const apiKey = "af6fa89c9d394c229fbe9fcbe992a826";
//   const handleNavigation = useNavigate();

//   useEffect(() => {
//     // Update every second
//     const interval = setInterval(() => {
//       setTime(new Date());
//     }, 1000); // you can use 60000 for every minute instead

//     return () => clearInterval(interval); // cleanup
//   }, []);

//   const formattedTime = time.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
//   const [mainTime, period] = formattedTime.split(" ");

//   const formattedTimeStart = loginTime
//     ? loginTime.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       })
//     : "";
//   const [mainTimestrt, periodstrt] = formattedTimeStart
//     ? formattedTimeStart.split(" ")
//     : ["", ""];

//   // Get user current location and convert to address
//   const getUserCurrent = async (latitude, longitude) => {
//     const query = `${latitude},${longitude}`;
//     const apiUrl = `${apiEndpoint}?key=${apiKey}&q=${query}`;
//     try {
//       const res = await fetch(apiUrl);
//       const data = await res.json();
//       setCurrentLocation(`${data.results[0].formatted}`);
//     } catch (error) {
//       console.error("Error fetching location:", error);
//     }
//   };

//   const updateLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const lat = position.coords.latitude;
//           const lon = position.coords.longitude;
//           getUserCurrent(lat, lon);
//         },
//         (error) => {
//           console.error("Location error:", error);
//           setCurrentLocation("Location access denied");
//         }
//       );
//     } else {
//       setCurrentLocation("Geolocation not supported");
//     }
//   };

//   useEffect(() => {
//     if (hasStartedWork) {
//       updateLocation();
//       const interval = setInterval(updateLocation, 10 * 60 * 1000);
//       return () => clearInterval(interval);
//     }
//   }, [hasStartedWork]);

//   const handleLogout = () => {
//     localStorage.removeItem("token"); // or whatever key you're storing
//     localStorage.removeItem("user");
//     navigate("/"); // redirect to login page
//   };

//   return (
//     <>
//       <div
//         className="w-full min-h-screen bg-no-repeat bg-top bg-contain flex "
//         style={{ backgroundImage: `url(${backgr})` }}
//       >
//         {/* Top Logo */}
//         <div className="flex flex-col justify-between h-screen">
//           <div className="w-full  flex items-center px-5 ">
//             <Menu onClick={handleLogout} />
//             <img src={logo} alt="Logo" className="w-40 pl-10 " />
//           </div>

//           <div className="items-center flex flex-col justify-between w-screen h-screen">
//             <div className="pt-5">
//               <button
//                 onClick={() => !hasStartedWork && setShowPopup(true)}
//                 className="relative flex flex-col items-center justify-center"
//               >
//                 <div
//                   className={`w-45 h-45 rounded-full bg-cover border-[3px]  shadow-xl flex flex-col items-center justify-center text-center
//         ${
//           hasStartedWork
//             ? "border-blue-400 shadow-blue-200 "
//             : "border-orange-300 shadow-orange"
//         }`}
//                   style={{ backgroundImage: `url(${bg})` }}
//                 >
//                   {!hasStartedWork ? (
//                     <>
//                       <span className="text-4xl text-neutral-600 ">
//                         {mainTime}
//                       </span>
//                       <span className="text-xs uppercase ">{period}</span>
//                       <p className="text-blue-600 text-sm font-medium pt-5">
//                         Start Working
//                       </p>
//                       <span className="absolute top-[10px] text-xl">📍</span>
//                     </>
//                   ) : (
//                     <>
//                       <p className="text-xs text-gray-500">Since</p>
//                       <span className="text-xl text-neutral-600 ">
//                         {mainTimestrt}{" "}
//                         <span className="text-[7px] ">{periodstrt} </span>
//                       </span>

//                       <p className="text-[8px]  text-gray-500 px-2">
//                         📍 {currentLocation || "Fetching..."}
//                       </p>
//                       <p className="text-4xl text-neutral-600 ">{mainTime} </p>
//                       <span className="text-xs uppercase ">{period}</span>
//                       <button
//                         className="text-pink-600 opacity-70 text-xs font-semibold mt-1"
//                         onClick={() => {
//                           setHasStartedWork(false);
//                           setLoginTime(null);
//                           setCurrentLocation("");
//                           alert("You have stopped working.");
//                           setShowPopStop(true);
//                         }}
//                       >
//                         Stop Working
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </button>
//             </div>

//             {showPopup && (
//               <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//                 <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md space-y-4">
//                   <h2 className="text-lg font-bold text-center">
//                     Where are you working today?
//                   </h2>

//                   <div className="flex flex-col gap-2">
//                     {[
//                       "Out of station",
//                       "Existing Station",
//                       "Work from home",
//                     ].map((mode) => (
//                       <label key={mode} className="flex items-center gap-2">
//                         <input
//                           type="radio"
//                           name="workMode"
//                           value={mode}
//                           checked={workMode === mode}
//                           onChange={(e) => setWorkMode(e.target.value)}
//                         />
//                         {mode}
//                       </label>
//                     ))}
//                   </div>

//                   <div className="flex flex-col gap-1">
//                     <label className="text-sm font-medium">Select Route</label>
//                     <select
//                       value={route}
//                       onChange={(e) => setRoute(e.target.value)}
//                       className="p-2 border rounded"
//                     >
//                       <option value="">Select a Route</option>
//                       <option value="Route A">Route A</option>
//                       <option value="Route B">Route B</option>
//                       <option value="Route C">Route C</option>
//                     </select>
//                   </div>

//                   <div className="flex justify-between mt-4">
//                     <button
//                       onClick={() => setShowPopup(false)}
//                       className="text-sm text-red-600"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={() => {
//                         if (!workMode || !route) {
//                           alert("Please select work mode and route.");
//                           return;
//                         }
//                         setHasStartedWork(true);
//                         setLoginTime(new Date());
//                         setShowPopup(false);
//                         updateLocation();
//                       }}
//                       className="bg-blue-600 text-white px-4 py-2 rounded"
//                     >
//                       Submit
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {showPopStop && (
//               <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//                 <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md space-y-4">
//                   <h2 className="text-lg font-bold text-center">
//                     Stop For the day
//                   </h2>

//                   <div className="flex flex-col gap-2">
//                     {[
//                       "Have you complete your quota today ?",
//                       "Have you mate all doctors? ",
//                     ].map((mode) => (
//                       <label key={mode} className="flex items-center gap-2">
//                         <input
//                           type="radio"
//                           name="workMode"
//                           value={mode}
//                           checked={workMode === mode}
//                           onChange={(e) => setWorkMode(e.target.value)}
//                         />
//                         {mode}
//                       </label>
//                     ))}
//                   </div>

//                   <div className="flex flex-col gap-1">
//                     <label className="text-sm font-medium">Select Route</label>
//                     <select
//                       value={route}
//                       onChange={(e) => setRoute(e.target.value)}
//                       className="p-2 border border-neutral-400 rounded"
//                     >
//                       <option value="">Select a Route</option>
//                       <option value="Route A">Route A</option>
//                       <option value="Route B">Route B</option>
//                       <option value="Route C">Route C</option>
//                     </select>
//                     <textarea
//                       name=""
//                       className="border border-neutral-400 h-30 mt-2 rounded"
//                       id=""
//                     ></textarea>
//                   </div>

//                   <div className="flex justify-between mt-4">
//                     <button
//                       onClick={() => setShowPopup(false)}
//                       className="text-sm text-red-600"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={() => {
//                         if (!workMode || !route) {
//                           alert("Please select work mode and route.");
//                           return;
//                         }
//                         setHasStartedWork(false);
//                         setLoginTime(new Date());
//                         setShowPopStop(false);
//                         updateLocation();
//                       }}
//                       className="bg-blue-600 text-white px-4 py-2 rounded"
//                     >
//                       Submit
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="overflow-y-scroll mt-7 px-10 w-full">
//               <div className="grid grid-cols-2 gap-4 w-full max-w-[760px] mx-auto">
//                 <HomeButton
//                   title="Visits"
//                   icon={<Calendar />}
//                   color="bg-purple-100"
//                   onClick={() => handleNavigation("/visits")}
//                 />
//                 <HomeButton
//                   title="Client"
//                   icon={<User />}
//                   color="bg-pink-100"
//                   onClick={() => handleNavigation("/client")}
//                 />
//                 <HomeButton
//                   title="Hospitals"
//                   icon={<Hospital />}
//                   color="bg-green-100"
//                   onClick={() => handleNavigation("/hospitals")}
//                 />
//                 <HomeButton
//                   title="Report"
//                   icon={<FileText />}
//                   color="bg-gray-100"
//                   onClick={() => handleNavigation("/report")}
//                 />
//                 <HomeButton
//                   title="Report"
//                   icon={<FileText />}
//                   color="bg-gray-100"
//                   onClick={() => handleNavigation("/report")}
//                 />
//                 <HomeButton
//                   title="Reminder"
//                   icon={<Bell />}
//                   color="bg-cyan-100"
//                   onClick={() => handleNavigation("/reminder")}
//                 />
//                 <HomeButton
//                   title="Admin"
//                   icon={<User />}
//                   color="bg-indigo-100"
//                   onClick={() => handleNavigation("/admin")}
//                 />
//                 <HomeButton
//                   title="Reminder"
//                   icon={<Bell />}
//                   color="bg-cyan-100"
//                   onClick={() => handleNavigation("/reminder")}
//                 />
//                 <HomeButton
//                   title="Admin"
//                   icon={<User />}
//                   color="bg-indigo-100"
//                   onClick={() => handleNavigation("/admin")}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// const HomeButton = ({ title, icon, color, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`flex flex-col items-center justify-center rounded-xl p-12 ${color} active:scale-95 transition-transform duration-200`}
//   >
//     <div className="mb-2 text-blue-700">{icon}</div>
//     <p className="font-semibold">{title}</p>
//   </button>
// );

// export default Home;





import React, { useEffect, useState } from "react";
import backgr from "../../assets/homedsk1.png";
import logo from "../../assets/logo-vr-removebg-preview.png";
import { setStorageItem, getStorageItem, removeStorageItem } from "../../../../backend/utils/storage.js";
import { Menu, User, Calendar, FileText, Bell, Hospital } from "lucide-react";
import bg from "../../assets/Untitled-28.png";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showPopup, setShowPopup] = useState(false);
  const [showPopStop, setShowPopStop] = useState(false);
  const [workMode, setWorkMode] = useState("");
  const [route, setRoute] = useState("");
  const [hasStartedWork, setHasStartedWork] = useState(false);
  const [loginTime, setLoginTime] = useState(null);
  const [currentLocation, setCurrentLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const apiEndpoint = "https://api.opencagedata.com/geocode/v1/json";
  const apiKey = "af6fa89c9d394c229fbe9fcbe992a826";

  // Time updater
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time display
  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const [mainTime, period] = formattedTime.split(" ");

  const formattedTimeStart = loginTime?.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }) || "";
  const [mainTimestrt, periodstrt] = formattedTimeStart.split(" ");

  // Location handling
  const getUserCurrent = async (latitude, longitude) => {
    try {
      const query = `${latitude},${longitude}`;
      const res = await fetch(`${apiEndpoint}?key=${apiKey}&q=${query}`);
      const data = await res.json();
      const location = data.results[0]?.formatted || "Unknown location";
      setCurrentLocation(location);
      await setStorageItem('currentLocation', location);
    } catch (error) {
      console.error("Error fetching location:", error);
      setCurrentLocation("Location unavailable");
    }
  };

  const updateLocation = () => {
    if (!navigator.geolocation) {
      setCurrentLocation("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        getUserCurrent(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Location error:", error);
        setCurrentLocation("Location access denied");
      }
    );
  };

  // Load saved state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const [
          savedWorkStatus,
          savedLoginTime,
          savedLocation
        ] = await Promise.all([
          getStorageItem('hasStartedWork'),
          getStorageItem('loginTime'),
          getStorageItem('currentLocation')
        ]);

        if (savedWorkStatus) setHasStartedWork(savedWorkStatus === 'true');
        if (savedLoginTime) setLoginTime(new Date(savedLoginTime));
        if (savedLocation) setCurrentLocation(savedLocation);
      } catch (error) {
        console.error("Error loading saved state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedState();
  }, []);

  // Location update interval when working
  useEffect(() => {
    if (!hasStartedWork) return;

    updateLocation();
    const interval = setInterval(updateLocation, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [hasStartedWork]);

  // Work status handlers
  const handleStartWork = async () => {
    if (!workMode || !route) {
      alert("Please select work mode and route.");
      return;
    }
    setShowPopup(false);
    const now = new Date();
    setHasStartedWork(true);
    setLoginTime(now);
    await Promise.all([
      setStorageItem('hasStartedWork', 'true'),
      setStorageItem('loginTime', now.toISOString()),
      setStorageItem('workMode', workMode),
      setStorageItem('route', route)
    ]);
    
    updateLocation();
  };

  const handleStopWork = async () => {
    setHasStartedWork(false);
    setLoginTime(null);
    setCurrentLocation("");
    await Promise.all([
      removeStorageItem('hasStartedWork'),
      removeStorageItem('loginTime'),
      removeStorageItem('currentLocation')
    ]);
    setShowPopStop(false);
    alert("You have stopped working.");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-no-repeat bg-top bg-contain flex" style={{ backgroundImage: `url(${backgr})` }}>
      <div className="flex flex-col justify-between h-screen w-full">
        <div className="w-full flex items-center px-5">
          <Menu onClick={handleLogout} className="cursor-pointer" />
          <img src={logo} alt="Logo" className="w-40 pl-10" />
        </div>

        <div className="items-center flex flex-col justify-between h-full pb-6">
          <div className="pt-5">
            <div
              onClick={() => !hasStartedWork && setShowPopup(true)}
              className={`relative flex flex-col items-center justify-center w-45 h-45 rounded-full bg-cover border-[3px] shadow-xl ${
                hasStartedWork
                  ? "border-blue-400 shadow-blue-200 cursor-default"
                  : "border-orange-300 shadow-orange cursor-pointer"
              }`}
              style={{ backgroundImage: `url(${bg})` }}
            >
              {!hasStartedWork ? (
                <>
                  <span className="text-4xl text-neutral-600">{mainTime}</span>
                  <span className="text-xs uppercase">{period}</span>
                  <p className="text-blue-600 text-sm font-medium pt-5">
                    Start Working
                  </p>
                  <span className="absolute top-[10px] text-xl">📍</span>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500">Since</p>
                  <span className="text-xl text-neutral-600">
                    {mainTimestrt}{" "}
                    <span className="text-[7px]">{periodstrt}</span>
                  </span>
                  <p className="text-[8px] text-gray-500 px-2 text-center">
                    📍 {currentLocation || "Fetching..."}
                  </p>
                  <p className="text-4xl text-neutral-600">{mainTime}</p>
                  <span className="text-xs uppercase">{period}</span>
                  <button
                    className="text-pink-600 opacity-70 text-xs font-semibold mt-1 pb-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPopStop(true);
                    }}
                  >
                    Stop Working
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Start Work Popup */}
          {showPopup && (
            <div className="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md space-y-4">
                <h2 className="text-lg font-bold text-center">Where are you working today?</h2>
                <div className="flex flex-col gap-2">
                  {["Out of station", "Existing Station", "Work from home"].map((mode) => (
                    <label key={mode} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="workMode"
                        value={mode}
                        checked={workMode === mode}
                        onChange={(e) => setWorkMode(e.target.value)}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Select Route</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="">Select a Route</option>
                    <option value="Route A">Route A</option>
                    <option value="Route B">Route B</option>
                    <option value="Route C">Route C</option>
                  </select>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-sm text-red-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartWork}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stop Work Popup */}
          {showPopStop && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md space-y-4">
                <h2 className="text-lg font-bold text-center">Stop For the day</h2>
                <div className="flex flex-col gap-2">
                  {[
                    "Have you completed your quota today?",
                    "Have you met all doctors?",
                  ].map((mode) => (
                    <label key={mode} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="workMode"
                        value={mode}
                        checked={workMode === mode}
                        onChange={(e) => setWorkMode(e.target.value)}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Select Route</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="p-2 border border-neutral-400 rounded"
                  >
                    <option value="">Select a Route</option>
                    <option value="Route A">Route A</option>
                    <option value="Route B">Route B</option>
                    <option value="Route C">Route C</option>
                  </select>
                  <textarea
                    placeholder="Any additional notes..."
                    className="border border-neutral-400 h-30 mt-2 rounded p-2"
                  ></textarea>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setShowPopStop(false)}
                    className="text-sm text-red-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStopWork}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* App Menu Buttons */}
          <div className="overflow-y-auto mt-7 px-10 w-full">
            <div className="grid grid-cols-2 gap-4 w-full max-w-[760px] mx-auto">
              {[
                { title: "Visits", icon: <Calendar />, color: "bg-purple-100", path: "/visits" },
                { title: "Client", icon: <User />, color: "bg-pink-100", path: "/client" },
                { title: "Hospitals", icon: <Hospital />, color: "bg-green-100", path: "/hospitals" },
                { title: "Report", icon: <FileText />, color: "bg-gray-100", path: "/report" },
                { title: "Reminder", icon: <Bell />, color: "bg-cyan-100", path: "/reminder" },
                { title: "Admin", icon: <User />, color: "bg-indigo-100", path: "/admin" },
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center rounded-xl p-12 ${item.color} active:scale-95 transition-transform duration-200`}
                >
                  <div className="mb-2 text-blue-700">{item.icon}</div>
                  <p className="font-semibold">{item.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
