import { db } from "../db/db.js";
export const searchDoctorsByName = async (req, res) => {
    const { q } = req.query; // search term
    const mrId = req.user.id;
  
    try {
      const [results] = await db.query(
        `SELECT d.id, d.name, d.speciality, a.visit_day, 
                DATE_FORMAT(a.visit_time, '%h:%i %p') AS visit_time, 
                 a.address
         FROM mr_doctor_assign a
         JOIN doctor d ON a.doctor_id = d.id
         WHERE a.mr_id = ? AND d.name LIKE ?`,
        [mrId, `%${q}%`]
      );
  
      res.json(results);
    } catch (error) {
      console.error("❌ Error in searchDoctorsByName:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  