import { db } from "../db/db.js";
import cloudinary from "../Config/cloudinary.js";

export const createDoctor = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  console.log('All request keys:', Object.keys(req));

  if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
  }
  const mrId = req.user.id;
  const {
      name,
      designation,
      hospital_or_clinic,
      gender,
      speciality,
      address,
      latitude,
      longitude,
      visit_day,
      visit_time,
      phone_number,
      email,
      dob,
  } = req.body;

  if (!name || !speciality || !phone_number) {
      return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, speciality, or phone_number'
      });
  }

  try {
      await db.beginTransaction();

      const uploadToCloudinary = (buffer, folder, resourceType) => {
          return new Promise((resolve, reject) => {
              if (!buffer) {
                  resolve(null); // Return null if no buffer provided
                  return;
              }
              const uploadStream = cloudinary.uploader.upload_stream(
                  { folder, resource_type: resourceType },
                  (error, result) => {
                      if (error) reject(error);
                      else resolve(result.secure_url);
                  }
              );
              uploadStream.end(buffer);
          });
      };

      // 1. Upload profile image if exists
      let profileImgUrl = null;
      if (req.files?.profile_img) {
          profileImgUrl = await uploadToCloudinary(
              req.files.profile_img[0].buffer,
              "doctors/profile_img",
              "auto"
          );
      }

      // 2. Upload PDF if exists
      let pdfUrl = null;
      if (req.files?.pdf) {
          pdfUrl = await uploadToCloudinary(
              req.files.pdf[0].buffer,
              "doctors/pdfs",
              "raw"
          );
      }

      // Convert undefined values to null for database insertion
      const dbParams = [
          name,
          designation || null,
          hospital_or_clinic || null,
          gender || null,
          speciality,
          address || null,
          latitude || null,
          longitude || null,
          phone_number,
          email || null,
          dob || null,
          profileImgUrl, // already null if not uploaded
          pdfUrl // already null if not uploaded
      ];

      // 3. Insert into doctor table
      const [doctorResult] = await db.execute(
          `INSERT INTO doctor 
           (name, designation, hospital_or_clinic, gender, speciality, address, 
            latitude, longitude, phone_number, email, dob, profile_img, pdf)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          dbParams
      );

      const doctorId = doctorResult.insertId;

      // 4. Assign to MR
      await db.execute(
          `INSERT INTO mr_doctor_assign 
           (mr_id, doctor_id, visit_day, visit_time)
           VALUES (?, ?, ?, ?)`,
          [
              mrId, 
              doctorId, 
              visit_day || null, 
              visit_time || null
          ]
      );

      await db.commit();

      res.status(201).json({
          success: true,
          message: "Doctor created and assigned successfully",
          doctorId
      });

  } catch (error) {
      await db.rollback();
      console.error("Error creating doctor:", error);
      res.status(500).json({ 
          success: false,
          message: "Failed to create doctor"
      });
  }
};


export const createHospitalManager = async (req, res) => {
  if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const mrId = req.user.id;
  const {
      name,
      position,
      hospital_name,
      hospital_address,
      latitude,
      longitude,
      visit_day,
      visit_time,
      contact_number,
      email
  } = req.body;

  if (!name || !hospital_name || !contact_number) {
      return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, hospital_name, or contact_number'
      });
  }

  try {
      await db.beginTransaction();

      // Helper function for file upload using buffer
      const uploadFile = async (file, folder, resourceType = 'auto') => {
          if (!file || !file[0] || !file[0].buffer) return null;
          
          try {
              return new Promise((resolve, reject) => {
                  const uploadStream = cloudinary.uploader.upload_stream(
                      { folder, resource_type: resourceType },
                      (error, result) => {
                          if (error) {
                              console.error(`Error uploading to ${folder}:`, error);
                              resolve(null);
                          } else {
                              resolve(result.secure_url);
                          }
                      }
                  );
                  uploadStream.end(file[0].buffer);
              });
          } catch (uploadError) {
              console.error(`Error uploading to ${folder}:`, uploadError);
              return null;
          }
      };

      // 1. Upload profile image if exists
      let profileImgUrl = null;
      if (req.files?.profile_img) {
          profileImgUrl = await uploadFile(
              req.files.profile_img,
              'hospital_managers/profile_images'
          );
      }

      // 2. Upload PDF if exists
      let pdfUrl = null;
      if (req.files?.pdf) {
          pdfUrl = await uploadFile(
              req.files.pdf,
              'hospital_managers/pdfs',
              'raw'
          );
      }

      // 3. Insert into hospital_managers table
      const [managerResult] = await db.execute(
          `INSERT INTO hospital_managers 
           (name, position, hospital_name, hospital_address, latitude, longitude, 
            profile_img, pdf, contact_number, email)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
              name,
              position || null,
              hospital_name,
              hospital_address || null,
              latitude || null,
              longitude || null,
              profileImgUrl,
              pdfUrl,
              contact_number,
              email || null,
              
          ]
      );

      const managerId = managerResult.insertId;

      // 4. Assign to MR
      await db.execute(
          `INSERT INTO mr_hospital_assign 
           (mr_id, hospital_manager_id, visit_day, visit_time)
           VALUES (?, ?, ?, ?)`,
          [
              mrId, 
              managerId, 
              visit_day || null, 
              visit_time || null
          ]
      );

      await db.commit();

      res.status(201).json({
          success: true,
          message: "Hospital manager created and assigned successfully",
          managerId
      });

  } catch (error) {
      await db.rollback();
      console.error("Error creating hospital manager:", error);
      res.status(500).json({ 
          success: false,
          message: "Failed to create hospital manager",
          error: error.message
      });
  }
};