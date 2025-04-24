import express from 'express';
// import { authenticateUser } from '../Middleware/authenticate.Middleware';
import { getDoctorById } from '../Controller/doctor.controller.js';

const doctorRouter=express.Router()

doctorRouter.get("/:id",getDoctorById)
export {doctorRouter}