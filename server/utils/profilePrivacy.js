
// ==========================================
// Profile Privacy Helper
// ==========================================

export const maskName = (name = "") => {
    if (!name) return "Profile Name Hidden";

    return name.charAt(0).toUpperCase() + "*****";
};

export const getSafeProfile = (profile, user) => {

    // Admin and Premium users see everything
    if (
        user?.role === "admin" ||
        user?.role === "super_admin" ||
        user?.membershipPlan !== "free"
    ) {
        return profile;
    }

    // Free users see limited details
    return {
        _id: profile._id,
        fullName: maskName(profile.fullName),
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        education: profile.education,
        occupation: profile.occupation,
        city: profile.city,
        state: profile.state,
        caste: profile.caste,
        profilePhoto: profile.profilePhoto,
    };
};