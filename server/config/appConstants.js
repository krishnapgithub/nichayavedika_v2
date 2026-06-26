


// ==========================================
// Login User
// ==========================================
export const loginUser = async (req, res) => {

    // ==========================================
    // Validate Request
    // ==========================================
    const { email, password } = req.body;

    // ==========================================
    // Find User
    // ==========================================
    const user = await User.findOne({ email });

    // ==========================================
    // Verify Password
    // ==========================================
    const isPasswordMatch = await bcrypt.compare(
        password,
        user.password
    );

    // ==========================================
    // Admin Approval Check
    // ==========================================
    if (user.status !== USER_STATUS.APPROVED) {
        return res.status(403).json({
            success: false,
            message: "Your registration is pending admin approval.",
        });
    }

    // ==========================================
    // Generate JWT Token
    // ==========================================
    const token = generateToken(user._id);
};





// ==========================================
// User Status
// ==========================================
export const USER_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

// ==========================================
// User Roles
// ==========================================
export const USER_ROLES = {
    USER: "user",
    ADMIN: "admin",
    OPER_ADMIN: "oper_admin",
    EXECUTIVE: "executive",
};

// ==========================================
// Membership Plans
// ==========================================
export const MEMBERSHIP_PLANS = {
    FREE: "free",
    PREMIUM: "premium",
    ELITE: "elite",
};

// ==========================================
// Application Settings
// ==========================================
export const APP_SETTINGS = {
    FREE_PROFILE_VIEWS: 5,
    SESSION_TIMEOUT_MINUTES: 2,
    MEMBERSHIP_VALIDITY_DAYS: 90,
};

export const FREE_PROFILE_VIEWS = APP_SETTINGS.FREE_PROFILE_VIEWS;

// ==========================================
// Registration Options
// ==========================================
export const GENDERS = [
    "Bride",
    "Groom",
];

export const REGISTERING_FOR = [
    "Self",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
];


