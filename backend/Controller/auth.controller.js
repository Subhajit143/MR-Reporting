import { db } from "../db/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Temporary in-memory store for OTPs
const otpStore = {};
const otpStoreLogin = {};

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Simulated function to send OTP (log to console for now)
const sendOTPToPhone = (phone, otp) => {
  console.log(`Sending OTP ${otp} to phone ${phone}`);
};

// Controller: Send OTP for registration

// Step 1: Send OTP
export const registerOTP = async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) return res.status(400).json({ message: "Phone number is required" });

  try {
    const [user] = await db.query("SELECT * FROM med_rep WHERE phone_number = ?", [phone_number]);
    if (user.length > 0) {
      return res.status(409).json({ message: "Phone number already registered" });
    }

    const otp = generateOTP();
    otpStore[phone_number] = { otp, timestamp: Date.now() };

    sendOTPToPhone(phone_number, otp);
    res.json({ message: "OTP sent to phone number", phone_number }); // send it back so client can use
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Step 2: Register (Don't send phone number again)
export const register = async (req, res) => {
  const {
    otp, name, gender, email, dob, area, designation, password
  } = req.body;

  // Retrieve phone number from headers
  const phone_number = req.headers["x-phone-number"];
  if (!phone_number || !otpStore[phone_number]) {
    return res.status(400).json({ message: "Missing or invalid phone number" });
  }
  const stored = otpStore[phone_number];

  if (stored.otp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const joining_date = new Date();

    await db.query(
      `INSERT INTO med_rep (name, gender, email, phone_number, dob, area, joining_date, designation, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, gender, email, phone_number, dob, area, joining_date, designation, hashedPassword]
    );

    delete otpStore[phone_number];

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during registration" });
  }
};

// Controller: Send OTP for login
export const loginOTP = async (req, res) => {
  const { phone_number, password } = req.body;

  if (!phone_number || !password) {
    return res.status(400).json({ message: "Phone number and password are required" });
  }

  try {
    const [user] = await db.query("SELECT * FROM med_rep WHERE phone_number = ?", [phone_number]);

    if (user.length === 0) {
      return res.status(404).json({ message: "MR not found" });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const otp = generateOTP();

    // Store for verification (you can add expiry logic if needed)
    otpStoreLogin[phone_number] = {
      otp,
      userId: user[0].id,
    };

    console.log(`Login OTP for ${phone_number}: ${otp}`);
    res.json({ message: "OTP sent to your phone number" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Controller: Verify OTP & password during login
export const loginVerify = async (req, res) => {
  const {  otp } = req.body;
  const phone_number = req.headers["x-phone-number"];
 if (!phone_number || !otpStoreLogin[phone_number]) {
  return res.status(400).json({ message: "Missing or invalid phone number" });
}
  const stored = otpStoreLogin[phone_number];
  if (!stored || stored.otp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  try {
    const token = jwt.sign({ id: stored.userId, role: "mr" }, process.env.JWT, { expiresIn: "20d" });

    // Clean up OTP store
    delete otpStoreLogin[phone_number];

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};










