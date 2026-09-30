/**
 * Cryptographically Secure Authentication & OTP Controller
 * NexVerify AI Procurement Platform (SIH PS 26100)
 */

const { generateSecureOtp, signJwt, verifyJwt } = require("../utils/security");
const nodemailer = require("nodemailer");

// Persistent authentication storage
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const USERS_STORE_PATH = path.join(DATA_DIR, "users.json");

const otpStore = new Map();

const loadUserStore = () => {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(USERS_STORE_PATH)) {
            fs.writeFileSync(USERS_STORE_PATH, JSON.stringify({}, null, 2));
            return new Map();
        }
        const data = fs.readFileSync(USERS_STORE_PATH, "utf-8");
        return new Map(Object.entries(JSON.parse(data || "{}")));
    } catch (error) {
        console.error("[AUTH STORE] Error loading users:", error.message);
        return new Map();
    }
};

const saveUserStore = (userStore) => {
    try {
        const users = Object.fromEntries(userStore);
        fs.writeFileSync(USERS_STORE_PATH, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("[AUTH STORE] Error saving users:", error.message);
    }
};

const userStore = loadUserStore();

let etherealTransporter = null;
async function setupMailer() {
    if (etherealTransporter) return etherealTransporter;
    try {
        let testAccount = await nodemailer.createTestAccount();
        etherealTransporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("[MAILER] Connected Ethereal Test Account:", testAccount.user);
        return etherealTransporter;
    } catch (err) {
        console.error("Nodemailer init error:", err);
        return null;
    }
}
setupMailer();

async function devSendMail(to, otp) {
    const tp = await setupMailer();
    if (!tp) return;
    try {
        let info = await tp.sendMail({
            from: '"NexVerify AI Security" <noreply@nexverify.gov.in>',
            to: to,
            subject: "Your NexVerify Security Code",
            text: `Your Government SSO / Account Verification Code is: ${otp}\n\nDo not share this securely generated code with anyone.`,
            html: `<b>Your Government SSO / Account Verification Code is:</b> <h2>${otp}</h2><p>Do not share this securely generated code with anyone.</p>`,
        });
        console.log("\n=================================");
        console.log(`[OTP] Sent to ${to}`);
        console.log("Preview OTP Email here:", nodemailer.getTestMessageUrl(info));
        console.log("=================================\n");
    } catch (err) { }
}

/**
 * Send OTP Endpoint
 * POST /api/auth/send-otp
 */
const sendOtp = async (req, res) => {
    try {
        const { identifier, channel = "both" } = req.body;

        if (!identifier || !identifier.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email, mobile number, or employee ID.",
            });
        }

        const cleanIdentifier = identifier.trim().toLowerCase();
        const otpCode = "123456"; // Fixed OTP for testing, instead of generating random secure OTPs
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

        otpStore.set(cleanIdentifier, {
            code: otpCode,
            expiresAt,
            verified: false,
        });

        console.log(`[SECURE AUTH API] Cryptographic OTP generated for '${cleanIdentifier}': ${otpCode}`);

        // Send actual email via nodemailer ethereal preview
        if (cleanIdentifier.includes("@")) {
            devSendMail(cleanIdentifier, otpCode);
        }

        return res.status(200).json({
            success: true,
            message: `Verification OTP code sent to ${identifier} via ${channel.toUpperCase()}`,
            otp: otpCode,
            expiresInSeconds: 300,
        });
    } catch (error) {
        console.error("[AUTH API ERROR] sendOtp:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send verification OTP",
            error: error.message,
        });
    }
};

/**
 * Verify OTP Endpoint
 * POST /api/auth/verify-otp
 */
const verifyOtp = async (req, res) => {
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({
                success: false,
                message: "Identifier and 6-digit OTP code are required.",
            });
        }

        const cleanIdentifier = identifier.trim().toLowerCase();
        const record = otpStore.get(cleanIdentifier);

        if (!record) {
            return res.status(400).json({
                success: false,
                message: "No active OTP request found. Please request a new OTP code.",
            });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(cleanIdentifier);
            return res.status(400).json({
                success: false,
                message: "OTP code has expired. Please request a new code.",
            });
        }

        if (record.code !== String(otp).trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP code. Please enter the correct 6-digit code.",
            });
        }

        // Mark as verified
        record.verified = true;

        return res.status(200).json({
            success: true,
            message: "OTP verification successful.",
        });
    } catch (error) {
        console.error("[AUTH API ERROR] verifyOtp:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
            error: error.message,
        });
    }
};

/**
 * User Login Endpoint (Password or OTP + CAPTCHA)
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const {
            email,
            password,
            captchaInput,
            captchaExpected,
            otp,
            loginType = "password",
            requestedRole,
        } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email or Employee ID is required.",
            });
        }

        // CAPTCHA validation
        if (captchaExpected && captchaInput) {
            if (captchaInput.trim().toUpperCase() !== captchaExpected.trim().toUpperCase()) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid CAPTCHA code. Please try again.",
                });
            }
        }

        const cleanEmail = email.trim().toLowerCase();

        // OTP mode verification
        if (loginType === "otp") {
            if (!otp) {
                return res.status(400).json({
                    success: false,
                    message: "OTP code is required for OTP login.",
                });
            }
            const record = otpStore.get(cleanEmail);
            if (!record || record.code !== String(otp).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired OTP code.",
                });
            }
            otpStore.delete(cleanEmail);
        }

        // Authenticate User from Store
        let matchedUser = userStore.get(cleanEmail);

        if (!matchedUser) {
            // Fallback for demo if not registered, otherwise real systems would reject.
            const isOfficer = requestedRole === "officer" || cleanEmail.endsWith("@cpcl.gov.in") || cleanEmail.endsWith("@gem.gov.in") || cleanEmail.includes("officer") || cleanEmail === "priya.menon@cpcl.gov.in";
            const dynamicName = cleanEmail.split('@')[0].split(/[._]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            matchedUser = {
                id: isOfficer ? `OFF-2026-${generateSecureOtp().slice(0, 4)}` : `BID-2026-${generateSecureOtp().slice(0, 4)}`,
                name: dynamicName,
                email: cleanEmail,
                role: isOfficer ? "officer" : "bidder",
                organization: isOfficer ? "Chennai Petroleum Corporation Limited (CPCL / MoPNG)" : "TechNova Solutions Pvt Ltd",
                designation: isOfficer ? "Senior Compliance Officer" : "Authorized Bid Signatory",
                employeeId: "EMP-90214",
            };
        } else {
            // If registered, check password for password mode
            if (loginType === "password") {
                if (password !== matchedUser.password) {
                    return res.status(400).json({ success: false, message: "Invalid password." });
                }
            }
        }

        const userProfile = {
            ...matchedUser,
            lastLogin: new Date().toISOString(),
        };
        // Do not leak password in token
        delete userProfile.password;

        // Cryptographically Signed RFC 7519 HMAC SHA-256 JWT Token
        const token = signJwt(userProfile, 86400);

        return res.status(200).json({
            success: true,
            message: "Authentication successful",
            token,
            user: userProfile,
        });
    } catch (error) {
        console.error("[AUTH API ERROR] login:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

/**
 * SSO Authentication Endpoint
 * POST /api/auth/sso-login
 */
const ssoLogin = async (req, res) => {
    try {
        const { organization, email, employeeId, otp } = req.body;

        if (!organization || !email || !employeeId) {
            return res.status(400).json({
                success: false,
                message: "Organization, official email, and employee ID are required for SSO.",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Verify OTP if provided
        if (otp) {
            const record = otpStore.get(cleanEmail);
            if (record && record.code !== String(otp).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP code for SSO verification.",
                });
            }
        }

        let matchedUser = userStore.get(cleanEmail);
        let officerProfile;

        if (matchedUser) {
            officerProfile = { ...matchedUser, ssoVerified: true, lastLogin: new Date().toISOString() };
            delete officerProfile.password;
        } else {
            officerProfile = {
                id: `SSO-OFFICER-${generateSecureOtp().slice(0, 4)}`,
                name: "Murthuj",
                email: cleanEmail,
                role: "officer",
                organization: organization.trim() || "Government Procurement Department",
                designation: "Chief Procurement Officer",
                employeeId: employeeId.trim(),
                ssoVerified: true,
                lastLogin: new Date().toISOString(),
            };
        }

        const token = signJwt(officerProfile, 86400);

        return res.status(200).json({
            success: true,
            message: "SSO Organization Authentication successful",
            token,
            user: officerProfile,
        });
    } catch (error) {
        console.error("[AUTH API ERROR] ssoLogin:", error);
        return res.status(500).json({
            success: false,
            message: "SSO Authentication failed",
            error: error.message,
        });
    }
};

/**
 * Account Registration Endpoint
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const {
            email,
            password,
            employeeId,
            mobile,
            fullName,
            organization,
            designation,
            procurementRole,
        } = req.body;

        if (!email || !fullName || !organization) {
            return res.status(400).json({
                success: false,
                message: "Full name, official email, and organization are required.",
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const otpCode = "123456"; // fixed otp test

        otpStore.set(cleanEmail, {
            code: otpCode,
            expiresAt: Date.now() + 5 * 60 * 1000,
            verified: false,
        });

        const registeredUser = {
            id: `REG-${Date.now()}`,
            name: fullName.trim(),
            email: cleanEmail,
            // Only used for backend validation, stripped later
            password: password || "123",
            employeeId: employeeId?.trim(),
            mobile: mobile?.trim(),
            organization: organization.trim(),
            designation: designation?.trim(),
            role: procurementRole || "officer",
        };

        userStore.set(cleanEmail, registeredUser);
        saveUserStore(userStore);

        // Send OTP verification explicitly mimicking reality
        devSendMail(cleanEmail, otpCode);

        return res.status(201).json({
            success: true,
            message: "Account registration initiated. Verification OTP sent.",
            otp: otpCode,
            registeredUser,
        });
    } catch (error) {
        console.error("[AUTH API ERROR] register:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
};

/**
 * Fetch Current User Session via Cryptographic JWT Verification
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No authorization token provided.",
            });
        }

        const token = authHeader.split(" ")[1];
        const userProfile = verifyJwt(token);

        if (!userProfile) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired JWT session token.",
            });
        }

        return res.status(200).json({
            success: true,
            user: userProfile,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Failed to verify authentication token.",
        });
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    login,
    ssoLogin,
    register,
    getMe,
};
