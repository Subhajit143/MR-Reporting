
import moment from "moment";

// Helper to get weekday name
const getTodayWeekday = () => moment().format("dddd"); // e.g., 'Monday'

export const generateTodayVisitLogs = async (req, res) => {
  const today = moment().format("YYYY-MM-DD");
  const weekday = getTodayWeekday();

  try {
    // Fetch scheduled visits for today
    const [assignments] = await db.execute(`
      SELECT * FROM mr_doctor_assign 
      WHERE visit_day = ?
    `, [weekday]);

    if (assignments.length === 0) {
      return res.status(404).json({ message: "No scheduled visits for today" });
    }

    // Insert logs for each assignment
    for (const assignment of assignments) {
      const { mr_id, doctor_id, visit_time } = assignment;

      // Check if already inserted (avoid duplicates)
      const [existing] = await db.execute(`
        SELECT * FROM mr_visit_logs 
        WHERE mr_id = ? AND doctor_id = ? AND visit_date = ?
      `, [mr_id, doctor_id, today]);

      if (existing.length === 0) {
        await db.execute(`
          INSERT INTO mr_visit_logs (mr_id, doctor_id, visit_date, visit_time, status) 
          VALUES (?, ?, ?, ?, 'Pending')
        `, [mr_id, doctor_id, today, visit_time]);
      }
    }

    res.json({ message: "Visit logs generated for today ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate visit logs" });
  }
};
