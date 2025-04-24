
import {db} from "../db/db.js"



export const assignDoctorToMR = async (req, res) => {
    const { mr_id, assignments } = req.body;
  
    if (!mr_id || !Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ message: "MR ID and assignments are required" });
    }
  
    try {
      for (const { doctor_id, visit_day, visit_time } of assignments) {
        await db.query(
          `INSERT INTO mr_doctor_assign (mr_id, doctor_id, visit_day, visit_time) VALUES (?, ?, ?, ?)`,
          [mr_id, doctor_id, visit_day, visit_time]
        );
      }
  
      res.status(201).json({ message: "Doctor(s) assigned successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to assign doctor(s)" });
    }
  };
  