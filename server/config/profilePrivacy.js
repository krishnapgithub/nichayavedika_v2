
export const maskName = (name = "") => {
    if (!name) return "Premium Match";
    return `${name.charAt(0).toUpperCase()} • Premium Match`;
};

export const getSafeProfile = (profile, user = null) => {
    const role = user?.role;
    const plan = user?.membershipPlan;
    const isAdmin = role === "admin" || role === "super_admin";
    const isPaidMember = plan === "premium" || plan === "elite";
    const isOwnProfile =
        Boolean(profile?.user && user) &&
        String(profile.user?._id || profile.user) === String(user._id || user.id);
    const canShowPhotos = isAdmin || isOwnProfile || profile.showPhotosToMembers !== false;

    if (isAdmin || isPaidMember) {
        if (canShowPhotos) return profile;

        const safeProfile = profile?.toObject ? profile.toObject() : { ...profile };
        safeProfile.profilePhoto = "";
        safeProfile.stylishPhotos = [];
        return safeProfile;
    }

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
        profilePhoto: canShowPhotos && profile.profilePhoto
            ? "/images/blurred-profile.png"
            : "/images/default-profile.png",
        showPhotosToMembers: profile.showPhotosToMembers,
        status: profile.status,
    };
};
