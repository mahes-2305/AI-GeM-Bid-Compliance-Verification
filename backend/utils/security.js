/**
 * Cryptographic Security Utility Module
 * NexVerify AI Procurement Platform (SIH PS 26100)
 */

const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "NEXVERIFY_SECRET_KEY_SIH_2026_CPCL_GOV";

/**
 * Generate 6-digit cryptographic random OTP code
 */
const generateSecureOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Safe Base64URL Encoding
 */
const base64UrlEncode = (str) => {
    return Buffer.from(str)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

/**
 * Safe Base64URL Decoding
 */
const base64UrlDecode = (str) => {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    return Buffer.from(base64, "base64").toString("utf-8");
};

/**
 * Sign RFC 7519 JWT HMAC SHA-256 Token
 */
const signJwt = (payload, expiresInSeconds = 86400) => {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
        ...payload,
        iat: now,
        exp: now + expiresInSeconds,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
        .createHmac("sha256", JWT_SECRET)
        .update(dataToSign)
        .digest("base64url");

    return `${dataToSign}.${signature}`;
};

/**
 * Verify RFC 7519 JWT HMAC SHA-256 Token
 */
const verifyJwt = (token) => {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
        .createHmac("sha256", JWT_SECRET)
        .update(dataToSign)
        .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null; // Invalid signature
    }

    try {
        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && now > payload.exp) {
            return null; // Expired token
        }
        return payload;
    } catch (err) {
        return null;
    }
};

/**
 * Hash Password using PBKDF2 SHA-256
 */
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
    return `${salt}:${hash}`;
};

/**
 * Verify Password using PBKDF2 SHA-256
 */
const verifyPassword = (password, storedHash) => {
    if (!storedHash || !storedHash.includes(":")) return false;
    const [salt, originalHash] = storedHash.split(":");
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(originalHash));
};

module.exports = {
    generateSecureOtp,
    signJwt,
    verifyJwt,
    hashPassword,
    verifyPassword,
};
