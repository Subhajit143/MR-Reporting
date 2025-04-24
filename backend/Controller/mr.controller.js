import { db } from "../db/db.js";
import haversine from "haversine-distance";
import moment from "moment";

// Helper function to format time for display (24h to AM/PM)
const formatTimeForDisplay = (timeStr) => {
  if (!timeStr) return "--:--";

  // If already in AM/PM format, return as-is
  if (timeStr.includes(" ")) return timeStr;

  // Convert 24h to 12h AM/PM format
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Helper function to ensure consistent time comparison
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;

  // Handle both "11:00 AM" and "13:00:00" formats
  let time = timeStr;
  if (time.includes(" ")) {
    const [timePart, period] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper to get weekday name
const getTodayWeekday = () => moment().format("dddd");

// Helper: Check distance between MR and Doctor
const isWithin200Meters = (mrCoords, doctorCoords) => {
  const distance = haversine(mrCoords, doctorCoords);
  return distance <= 200;
};

export const getMRVisits = async (req, res) => {
  const mrId = req.user.id;
  const today = new Date();
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = daysOfWeek[today.getDay()];
  const tomorrowName = daysOfWeek[(today.getDay() + 1) % 7];

  try {
    await generateTodayVisitLogs(req, res, false);

    // Get and sort visits with proper time handling
    const getAndSortVisits = async (query, params) => {
      const [visits] = await db.query(query, params);
      return visits
        .map((v) => ({
          ...v,
          visit_time: formatTimeForDisplay(v.visit_time),
        }))
        .sort(
          (a, b) => timeToMinutes(a.visit_time) - timeToMinutes(b.visit_time)
        );
    };

    const todayVisits = await getAndSortVisits(
      `SELECT d.id, d.name, d.speciality, d.address,
       a.visit_day, a.visit_time
       FROM mr_doctor_assign a
       JOIN doctor d ON a.doctor_id = d.id
       WHERE a.mr_id = ? AND a.visit_day = ?
       ORDER BY TIME(a.visit_time) ASC`,
      [mrId, todayName]
    );

    const todayHospitalVisits = await getAndSortVisits(
      `SELECT h.id, h.name, h.position , h.hospital_address,
      a.visit_day, a.visit_time
      FROM mr_hospital_assign a
      JOIN hospital_managers h ON a.hospital_manager_id = h.id
      WHERE a.mr_id = ? AND a.visit_day = ?
      ORDER BY TIME(a.visit_time) ASC`,
      [mrId, todayName]
    );

    const tomorrowVisits = await getAndSortVisits(
      `SELECT d.id, d.name, d.speciality, d.address,
       a.visit_day, a.visit_time
       FROM mr_doctor_assign a
       JOIN doctor d ON a.doctor_id = d.id
       WHERE a.mr_id = ? AND a.visit_day = ?
       ORDER BY TIME(a.visit_time) ASC`,
      [mrId, tomorrowName]
    );

    const allVisits = await getAndSortVisits(
      `SELECT d.id, d.name, d.speciality, d.address,
       a.visit_day, a.visit_time
       FROM mr_doctor_assign a
       JOIN doctor d ON a.doctor_id = d.id
       WHERE a.mr_id = ?
       ORDER BY TIME(a.visit_time) ASC`,
      [mrId]
    );

    const allHospitalVisits = await getAndSortVisits(
      `SELECT d.id , d.name , d.position , d.hospital_address,
      a.visit_day, a.visit_time
      FROM mr_hospital_assign a
      JOIN hospital_managers d ON a.hospital_manager_id = d.id
      WHERE a.mr_id = ?
       ORDER BY TIME(a.visit_time) ASC`,
      [mrId]
    );

    const [underAssigned] = await db.query(
      `SELECT doctor_id
       FROM mr_doctor_assign
       WHERE mr_id = ?
       GROUP BY doctor_id
       HAVING COUNT(DISTINCT visit_day) < 2`,
      [mrId]
    );

    res.json({
      today: todayVisits,
      todayHospital: todayHospitalVisits,
      tomorrow: tomorrowVisits,
      allAssignedDoctors: allVisits,
      allAssignedHospitals:allHospitalVisits,
      underAssignedDoctors: underAssigned.map((row) => row.doctor_id),
    });
  } catch (error) {
    console.error("❌ Error in getMRVisits:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markVisited = async (req, res) => {
  const logId = req.params.logId;
  const { mr_lat, mr_lng } = req.body;

  try {
    // Step 1: Fetch the log entry with its type and IDs
    const [logRows] = await db.execute(
      `SELECT visit_type, doctor_id, hospital_manager_id 
       FROM mr_visit_logs 
       WHERE id = ?`,
      [logId]
    );

    if (logRows.length === 0) {
      return res.status(404).json({ message: "Visit log not found" });
    }

    const log = logRows[0];
    let targetLatLng;

    // Step 2: Fetch location from the respective table
    if (log.visit_type === "doctor") {
      const [doctorRows] = await db.execute(
        `SELECT latitude, longitude FROM doctor WHERE id = ?`,
        [log.doctor_id]
      );
      if (doctorRows.length === 0) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      targetLatLng = {
        lat: doctorRows[0].latitude,
        lon: doctorRows[0].longitude,
      };
    } else if (log.visit_type === "hospital") {
      const [hospitalRows] = await db.execute(
        `SELECT latitude, longitude FROM hospital_managers WHERE id = ?`,
        [log.hospital_manager_id]
      );
      if (hospitalRows.length === 0) {
        return res.status(404).json({ message: "Hospital Manager not found" });
      }
      targetLatLng = {
        lat: hospitalRows[0].latitude,
        lon: hospitalRows[0].longitude,
      };
    } else {
      return res.status(400).json({ message: "Invalid visit type" });
    }

    // Step 3: Validate location within 200 meters
    const allowed = isWithin200Meters(
      { lat: mr_lat, lon: mr_lng },
      targetLatLng
    );

    if (!allowed) {
      return res.status(400).json({
        message: `You are not within 200 meters of the ${
          log.visit_type === "Doctor" ? "doctor" : "hospital"
        } location`,
      });
    }

    // Step 4: Mark as Visited
    await db.execute(
      `UPDATE mr_visit_logs 
       SET status = 'Visited', 
           location = ?,
           visited_at = NOW()
       WHERE id = ?`,
      [`${mr_lat},${mr_lng}`, logId]
    );

    res.json({ message: "Visit marked as Visited ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const markNotVisited = async (req, res) => {
  const logId = req.params.logId;
  try {
    await db.execute(
      `UPDATE mr_visit_logs 
       SET status = 'Not Visited',
           visited_at = NOW()
       WHERE id = ?`,
      [logId]
    );

    res.json({ message: "Visit marked as Not Visited ❌" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// extra
export const getTodayVisitLogs = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, d.name AS doctor_name, d.speciality
       FROM mr_visit_logs v
       JOIN doctor d ON v.doctor_id = d.id
       ORDER BY TIME(v.visit_time) ASC`
    );

    const formattedRows = rows.map((row) => ({
      ...row,
      visit_time: formatTimeForDisplay(row.visit_time),
    }));

    res.json(formattedRows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTodayVisitStatus = async (req, res) => {
  const mrId = req.user.id;
  const today = new Date().toLocaleDateString("en-CA");

  try {
    const [logs] = await db.execute(
      `SELECT 
         v.id AS visit_log_id,
         v.status,
         v.visit_time,
         d.id AS doctor_id,
         d.name AS name,
         d.speciality,
         d.address,
          d.profile_img, 
          d.pdf,
         visit_type
       FROM mr_visit_logs v
       JOIN doctor d ON v.doctor_id = d.id
       WHERE v.mr_id = ? AND v.visit_date = ?
       ORDER BY TIME(v.visit_time) ASC`,
      [mrId, today]
    );

    const [hospitalLogs] = await db.execute(
      `SELECT 
         v.id AS visit_log_id,
         v.status,
         v.visit_time,
         d.id AS hospital_manager_id,
         d.name AS name,
         d.position,
         d.hospital_address,
          d.profile_img, d.pdf,
         visit_type
       FROM mr_visit_logs v
       JOIN hospital_managers d ON v.hospital_manager_id = d.id
       WHERE v.mr_id = ? AND v.visit_date = ?
       ORDER BY TIME(v.visit_time) ASC`,
      [mrId, today]
    );

    const formattedLogs = logs.map((log) => ({
      ...log,
      visit_time: formatTimeForDisplay(log.visit_time),
    }));

    const formattedHospitalLogs = hospitalLogs.map((log) => ({
      ...log,
      visit_time: formatTimeForDisplay(log.visit_time),
    }));
    res.json({
       todayVisits: formattedLogs,
      todayHospitalVisits: formattedHospitalLogs });
  } catch (err) {
    console.error("❌ Error fetching today's visit status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateTodayVisitLogs = async (req, res, sendResponse = true) => {
  const today = moment().format("YYYY-MM-DD");
  const weekday = getTodayWeekday();
  const mrId = req?.user?.id;

  try {
    // Fetch doctor assignments
    const [doctorAssignments] = await db.execute(
      mrId
        ? `SELECT * FROM mr_doctor_assign 
           WHERE visit_day = ? AND mr_id = ?
           ORDER BY TIME(visit_time) ASC`
        : `SELECT * FROM mr_doctor_assign 
           WHERE visit_day = ?
           ORDER BY TIME(visit_time) ASC`,
      mrId ? [weekday, mrId] : [weekday]
    );

    // Fetch hospital assignments
    const [hospitalAssignments] = await db.execute(
      mrId
        ? `SELECT * FROM mr_hospital_assign 
           WHERE visit_day = ? AND mr_id = ?
           ORDER BY TIME(visit_time) ASC`
        : `SELECT * FROM mr_hospital_assign 
           WHERE visit_day = ?
           ORDER BY TIME(visit_time) ASC`,
      mrId ? [weekday, mrId] : [weekday]
    );

    const generatedLogs = [];

    // Insert doctor visit logs
    for (const assignment of doctorAssignments) {
      try {
        const [result] = await db.execute(
          `INSERT INTO mr_visit_logs 
           (mr_id, doctor_id, visit_date, visit_time, status, visit_type)
           SELECT ?, ?, ?, ?, 'Pending', 'doctor'
           FROM dual
           WHERE NOT EXISTS (
             SELECT 1 FROM mr_visit_logs 
             WHERE mr_id = ? AND doctor_id = ? AND visit_date = ? AND visit_type = 'Doctor'
           )`,
          [
            assignment.mr_id,
            assignment.doctor_id,
            today,
            assignment.visit_time,
            assignment.mr_id,
            assignment.doctor_id,
            today,
          ]
        );
        if (result.affectedRows > 0) {
          generatedLogs.push({
            ...assignment,
            visit_time: formatTimeForDisplay(assignment.visit_time),
            visit_type: "Doctor",
            status: "Pending",
          });
        }
      } catch (err) {
        if (err.code !== "ER_DUP_ENTRY") throw err;
      }
    }

    // Insert hospital visit logs
    for (const assignment of hospitalAssignments) {
      try {
        const [result] = await db.execute(
          `INSERT INTO mr_visit_logs 
           (mr_id, hospital_manager_id, visit_date, visit_time, status, visit_type)
           SELECT ?, ?, ?, ?, 'Pending', 'hospital'
           FROM dual
           WHERE NOT EXISTS (
             SELECT 1 FROM mr_visit_logs 
             WHERE mr_id = ? AND hospital_manager_id = ? AND visit_date = ? AND visit_type = 'Hospital'
           )`,
          [
            assignment.mr_id,
            assignment.hospital_manager_id,
            today,
            assignment.visit_time,
            assignment.mr_id,
            assignment.hospital_manager_id,
            today,
          ]
        );
        if (result.affectedRows > 0) {
          generatedLogs.push({
            ...assignment,
            visit_time: formatTimeForDisplay(assignment.visit_time),
            visit_type: "Hospital",
            status: "Pending",
          });
        }
      } catch (err) {
        if (err.code !== "ER_DUP_ENTRY") throw err;
      }
    }

    if (sendResponse) {
      res.json({
        message: "Visit logs for Doctor & Hospital generated ✅",
        generated_logs: generatedLogs,
        duplicatesPrevented: true,
      });
    }
  } catch (err) {
    console.error("Error generating visit logs:", err);
    if (sendResponse) {
      res.status(500).json({ message: "Failed to generate visit logs" });
    }
  }
};




