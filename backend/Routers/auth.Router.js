import express from "express";
import {
  registerOTP,
  register,
  loginOTP,
  loginVerify
} from "../Controller/auth.controller.js";

const routerAuth = express.Router();

// Step 1: Send OTP to phone number
routerAuth.post("/register", registerOTP);

// Step 2: Verify OTP and complete registration
routerAuth.post("/register/verify-otp-and-register", register);

// Step 3: Login using phone number and OTP
routerAuth.post("/login", loginOTP);

routerAuth.post("/login/verify", loginVerify);

export { routerAuth };
