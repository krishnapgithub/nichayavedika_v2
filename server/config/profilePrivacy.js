
export const maskName = (name = "") => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + "*****";
};

export const getSafeProfile = (profile, user = null) => {
    const role = user?.role;
    const plan = user?.membershipPlan;

    if (role === "admin" || plan === "premium") {
        return profile;
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
        profilePhoto: profile.profilePhoto
            ? "/images/blurred-profile.png"
            : "/images/default-profile.png",
        status: profile.status,
    };
};