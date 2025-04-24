import { db } from "../db/db.js";

export const getDoctorById = async (req, res) => {
  const doctorId = req.params.id;

  try {
    const [doctor] = await db.query(
      "SELECT * FROM doctor WHERE id = ?",
      [doctorId]
    );

    if (!doctor || doctor.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // ✅ Send doctor data back to client
    return res.status(200).json(doctor[0]);
  } catch (error) {
    console.error("Error Fetching Doctor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
