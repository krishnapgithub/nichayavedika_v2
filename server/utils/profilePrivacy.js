
// ==========================================
// Profile Privacy Helper
// ==========================================

export const maskName = (name = "") => {
    if (!name) return "Profile Name Hidden";

    return name.charAt(0).toUpperCase() + "*****";
};

export const getSafeProfile = (profile, user) => {
    const isAdmin =
        user?.role === "admin" || user?.role === "super_admin";
    const isPaidMember = ["premium", "elite"].includes(user?.membershipPlan);
    const isOwnProfile =
        Boolean(profile?.user && user) &&
        String(profile.user?._id || profile.user) === String(user._id || user.id);
    const canShowPhotos = isAdmin || isOwnProfile || profile.showPhotosToMembers !== false;

    // Admin and Premium users see everything
    if (isAdmin || isPaidMember) {
        if (canShowPhotos) return profile;

        const safeProfile = profile?.toObject ? profile.toObject() : { ...profile };
        safeProfile.profilePhoto = "";
        safeProfile.stylishPhotos = [];
        return safeProfile;
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
        profilePhoto: canShowPhotos ? profile.profilePhoto : "",
        showPhotosToMembers: profile.showPhotosToMembers,
    };
};
