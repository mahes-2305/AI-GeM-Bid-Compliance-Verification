/**
 * Authentication & OTP Routes
 * NexVerify AI Procurement Platform (SIH PS 26100)
 */

const express = require("express");
const router = express.Router();
const {
    sendOtp,
    verifyOtp,
    login,
    ssoLogin,
    register,
    getMe,
} = require("../controllers/authController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/sso-login", ssoLogin);
router.post("/register", register);
router.get("/me", getMe);

module.exports = router;
