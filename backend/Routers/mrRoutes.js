import express from 'express';

import {  generateTodayVisitLogs, getMRVisits, getTodayVisitLogs, getTodayVisitStatus, markNotVisited, markVisited } from '../Controller/mr.controller.js';
import { authenticateUser } from '../Middleware/authenticate.Middleware.js';
import { searchDoctorsByName } from "../Controller/search.controller.js";
import { createDoctor, createHospitalManager } from '../Controller/mr.post.controller.js';
import multer from 'multer';
// import { cleanupUploads } from '../Middleware/fileCleanup.js';




const router = express.Router();


router.get("/visits", authenticateUser, getMRVisits);
router.get("/search-doctors", authenticateUser, searchDoctorsByName);
router.post("/visits/:logId/visited", markVisited);
router.post("/visits/:logId/not-visited", markNotVisited);
router.get("/visits/generate-logs",generateTodayVisitLogs );
router.get("/visits/todays-visits",getTodayVisitLogs)
router.get("/visits/today-status", authenticateUser, getTodayVisitStatus);


//post
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
  
router.post('/addDoctor', 
    authenticateUser,
  upload.fields([
    { name: 'profile_img', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]), 
  
  createDoctor)

  router.post('/addHospitals', 
    authenticateUser,
    upload.fields([
      { name: 'profile_img', maxCount: 1 },
      { name: 'pdf', maxCount: 1 }
    ]), 
    
    createHospitalManager
  );


export {router}