// ==========================================
// API Base URL
// ==========================================
export const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://nichayavedika-v2.onrender.com";

// ==========================================
// Authentication Endpoints
// ==========================================
export const API_ENDPOINTS = {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    SEND_EMAIL_OTP: "/api/auth/send-email-otp",
    VERIFY_EMAIL_OTP: "/api/auth/verify-email-otp",
};

// ==========================================
// Default Export
// ==========================================
export default API_BASE_URL;