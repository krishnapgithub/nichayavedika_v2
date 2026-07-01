import Profile from "../models/Profile.js";
import User from "../models/User.js";
import Counter from "../models/Counter.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import fs from "fs/promises";

import { getSafeProfile } from "../utils/profilePrivacy.js";

const getUploadedPhotoPath = (file) => (file ? `uploads/${file.filename}` : "");

const toBoolean = (value, defaultValue = true) => {
    if (value === undefined || value === null || value === "") return defaultValue;
    if (typeof value === "boolean") return value;
    return value === "true";
};

const canSeeProfilePhotos = (profile, user) => {
    const role = user?.role?.toLowerCase?.().trim();
    const isAdmin = ["admin", "oper_admin", "super_admin"].includes(role);
    const isOwnProfile =
        Boolean(profile?.user && user) &&
        String(profile.user?._id || profile.user) === String(user._id || user.id);

    return isAdmin || isOwnProfile || profile?.showPhotosToMembers !== false;
};

const hideProfilePhotos = (profile) => {
    const safeProfile = profile?.toObject ? profile.toObject() : { ...profile };

    safeProfile.profilePhoto = "";
    safeProfile.stylishPhotos = [];

    return safeProfile;
};

const applyPhotoConsent = (profile, user = null) =>
    canSeeProfilePhotos(profile, user) ? profile : hideProfilePhotos(profile);

const normalizeProfileGender = (gender) => {
    const value = String(gender || "").trim().toLowerCase();

    if (["bride", "female"].includes(value)) return "Bride";
    if (["groom", "male"].includes(value)) return "Groom";
    return "";
};

const getOppositeGender = (gender) => {
    const normalizedGender = normalizeProfileGender(gender);

    if (normalizedGender === "Bride") return "Groom";
    if (normalizedGender === "Groom") return "Bride";
    return "";
};

const getExpectedGender = (registeringFor) => {
    if (["Son", "Brother"].includes(registeringFor)) return "Groom";
    if (["Daughter", "Sister"].includes(registeringFor)) return "Bride";
    return "";
};

const reviewTrackedFields = [
    "fullName",
    "gender",
    "dateOfBirth",
    "age",
    "height",
    "maritalStatus",
    "motherTongue",
    "religion",
    "caste",
    "subCaste",
    "gothram",
    "education",
    "occupation",
    "annualIncome",
    "city",
    "state",
    "country",
    "familyDetails",
    "contactPreference",
    "aboutMe",
    "preferredAgeFrom",
    "preferredAgeTo",
    "preferredCaste",
    "preferredLocation",
    "profilePhoto",
    "stylishPhotos",
    "showPhotosToMembers",
];

const normalizeReviewValue = (value) => {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (Array.isArray(value)) return JSON.stringify(value.map((item) => item || ""));
    if (typeof value === "boolean") return value ? "true" : "false";
    if (value === null || value === undefined) return "";

    return String(value).trim();
};

const getChangedProfileFields = (existingProfile, profileData) =>
    reviewTrackedFields.filter((field) =>
        Object.prototype.hasOwnProperty.call(profileData, field) &&
        normalizeReviewValue(existingProfile[field]) !== normalizeReviewValue(profileData[field])
    );

const buildChangeHistoryEntry = (existingProfile, nextData, changedFields, changedBy, source = "user") => {
    const previousData = {};
    const newData = {};

    changedFields.forEach((field) => {
        previousData[field] = existingProfile[field];
        newData[field] = nextData[field];
    });

    return {
        changedAt: new Date(),
        changedBy,
        source,
        changedFields,
        previousData,
        newData,
    };
};

const pickReviewData = (source, fields) =>
    fields.reduce((data, field) => {
        data[field] = source[field];
        return data;
    }, {});

const hasPendingProfileChanges = (profile) =>
    Object.keys(profile?.pendingReviewData || {}).length > 0 ||
    (profile?.reviewChanges || []).length > 0;

const getLatestReviewChangeEntry = (profile) => {
    const reviewFields = profile?.reviewChanges || [];
    const history = [...(profile?.changeHistory || [])].reverse();

    return history.find((entry) =>
        !entry.revertedAt &&
        entry.source !== "revert" &&
        (entry.changedFields || []).some((field) => reviewFields.includes(field))
    );
};

const isAdminUser = (user) => {
    const role = user?.role?.toLowerCase?.().trim();

    return ["admin", "oper_admin", "super_admin"].includes(role);
};

const isCloudinaryConfigured = () =>
    Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

const uploadProfilePhoto = async (file) => {
    if (!file) return "";

    if (!isCloudinaryConfigured()) {
        return getUploadedPhotoPath(file);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = process.env.CLOUDINARY_PROFILE_FOLDER || "nichaya-vedika/profiles";
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");
    const fileBuffer = await fs.readFile(file.path);
    const formData = new FormData();

    formData.append("file", new Blob([fileBuffer], { type: file.mimetype }), file.originalname);
    formData.append("api_key", process.env.CLOUDINARY_API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("folder", folder);
    formData.append("signature", signature);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error?.message || "Cloudinary photo upload failed");
    }

    await fs.unlink(file.path).catch(() => {});

    return result.secure_url;
};

export const getPendingProfiles = async (req, res) => {
    try {
        const { search = "", status = "all", page = 1, limit = 10 } = req.query;
        const currentPage = Math.max(Number(page) || 1, 1);
        const pageLimit = Math.max(Number(limit) || 10, 1);
        const allowedStatuses = ["pending", "approved", "rejected", "deactivated"];
        const filter = {};
        const andConditions = [];

        if (status === "pending") {
            andConditions.push({
                $or: [
                    { status: "pending" },
                    { reviewChanges: { $exists: true, $ne: [] } },
                ],
            });
        } else if (allowedStatuses.includes(status)) {
            filter.status = status;
        }

        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");

            andConditions.push({
                $or: [
                { profileNumber: searchRegex },
                { fullName: searchRegex },
                { mobile: searchRegex },
                { email: searchRegex },
                ],
            });
        }

        if (andConditions.length > 0) {
            filter.$and = andConditions;
        }

        const skip = (currentPage - 1) * pageLimit;
        const [profiles, total] = await Promise.all([
            Profile.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit),
            Profile.countDocuments(filter),
        ]);

        res.json({
            success: true,
            profiles,
            total,
            page: currentPage,
            totalPages: Math.ceil(total / pageLimit) || 1,
        });
    } catch (error) {
        console.error("Get admin profiles error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profiles",
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user._id,
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        return res.json({
            success: true,
            profile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const searchProfiles = async (req, res) => {
    try {

        const {
            gender,
            ageFrom,
            ageTo,
            caste,
            subCaste,
            education,
            occupation,
            city,
            state,
            profileNumber,
            search,
            advancedField,
            advancedValue,
            page = 1,
            limit = 10,
        } = req.query;

        const filter = {
            $and: [
                {
                    status: "approved",
                },
            ],
        };

        const shouldForceOppositeGender = req.user && !isAdminUser(req.user);
        const requiredGender =
            shouldForceOppositeGender
                ? getOppositeGender(req.user.gender)
                : normalizeProfileGender(gender);

        if (requiredGender) {
            const normalizedGender = requiredGender.trim().toLowerCase();
            const genderPattern =
                normalizedGender === "groom"
                    ? "^\\s*(groom|male)\\s*$"
                    : normalizedGender === "bride"
                        ? "^\\s*(bride|female)\\s*$"
                        : `^\\s*${requiredGender.trim()}\\s*$`;

            filter.$and.push({
                gender: new RegExp(genderPattern, "i"),
            });
        }
        if (caste) filter.caste = new RegExp(caste, "i");
        if (subCaste) filter.subCaste = new RegExp(subCaste, "i");
        if (education) filter.education = new RegExp(education, "i");
        if (occupation) filter.occupation = new RegExp(occupation, "i");
        if (city) filter.city = new RegExp(city, "i");
        if (state) filter.state = new RegExp(state, "i");
        if (profileNumber) filter.profileNumber = new RegExp(profileNumber, "i");

        const advancedSearchFields = [
            "profileNumber",
            "fullName",
            "gender",
            "age",
            "height",
            "maritalStatus",
            "motherTongue",
            "religion",
            "caste",
            "subCaste",
            "gothram",
            "education",
            "occupation",
            "annualIncome",
            "city",
            "state",
            "country",
            "familyDetails",
            "contactPreference",
            "aboutMe",
            "preferredAgeFrom",
            "preferredAgeTo",
            "preferredCaste",
            "preferredLocation",
        ];

        if (advancedValue?.trim()) {
            const trimmedAdvancedValue = advancedValue.trim();
            const selectedAdvancedField = advancedField || "any";
            const numericAdvancedFields = ["age", "preferredAgeFrom", "preferredAgeTo"];

            if (selectedAdvancedField === "any") {
                const advancedRegex = new RegExp(trimmedAdvancedValue, "i");
                const numericValue = Number(trimmedAdvancedValue);
                const advancedConditions = advancedSearchFields
                    .filter((field) => !numericAdvancedFields.includes(field))
                    .map((field) => ({ [field]: advancedRegex }));

                if (!Number.isNaN(numericValue)) {
                    numericAdvancedFields.forEach((field) => {
                        advancedConditions.push({ [field]: numericValue });
                    });
                }

                filter.$and.push({ $or: advancedConditions });
            } else if (
                advancedSearchFields.includes(selectedAdvancedField) &&
                !(shouldForceOppositeGender && selectedAdvancedField === "gender")
            ) {
                if (numericAdvancedFields.includes(selectedAdvancedField)) {
                    const numericValue = Number(trimmedAdvancedValue);

                    if (!Number.isNaN(numericValue)) {
                        filter[selectedAdvancedField] = numericValue;
                    }
                } else {
                    filter[selectedAdvancedField] = new RegExp(trimmedAdvancedValue, "i");
                }
            }
        }

        if (search?.trim()?.length >= 3) {
            const searchRegex = new RegExp(search.trim(), "i");

            filter.$and.push({
                $or: [
                    { profileNumber: searchRegex },
                    { fullName: searchRegex },
                    { caste: searchRegex },
                    { city: searchRegex },
                    { education: searchRegex },
                    { occupation: searchRegex },
                ],
            });
        }

        if (ageFrom || ageTo) {
            const ageFilter = {};

            if (ageFrom) ageFilter.$gte = Number(ageFrom);

            const requestedAgeTo = ageTo ? Number(ageTo) : null;

            if (requestedAgeTo) {
                ageFilter.$lte = requestedAgeTo;
            }

            filter.age = {
                ...(typeof filter.age === "number" ? { $eq: filter.age } : {}),
                ...(typeof filter.age === "object" && filter.age !== null ? filter.age : {}),
                ...ageFilter,
            };
        }

        const skip =
            (Number(page) - 1) * Number(limit);

        const profiles = await Profile.find(filter)
            .select(
                "profileNumber fullName age gender height education occupation city state caste subCaste profilePhoto stylishPhotos showPhotosToMembers aboutMe status"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total =
            await Profile.countDocuments(filter);

        res.json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(
                total / Number(limit)
            ),
            profiles: profiles.map((profile) => applyPhotoConsent(profile, req.user)),
        });

    } catch (error) {

        console.error(
            "Search profiles error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Search failed",
        });
    }
};

export const getProfileById = async (req, res) => {
    try {
        // Get profile first
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        const currentUser = req.user;
        const isOwnProfile =
            profile.user?.toString() === currentUser?._id?.toString() ||
            profile.user?.toString() === currentUser?.id?.toString();
        const isAdmin =
            currentUser?.role === "admin" || currentUser?.role === "super_admin";
        const isPaidMember = ["premium", "elite"].includes(
            currentUser?.membershipPlan
        );
        const requiredGender = !isAdmin && !isOwnProfile
            ? getOppositeGender(currentUser?.gender)
            : "";

        if (requiredGender && normalizeProfileGender(profile.gender) !== requiredGender) {
            return res.status(403).json({
                success: false,
                message: `Only ${requiredGender} profiles are available for your account`,
            });
        }

        // Admin / Premium see full details
        if (isOwnProfile || isAdmin || isPaidMember) {
            return res.json({
                success: true,
                profile: applyPhotoConsent(profile, currentUser),
            });
        }

        // Free user sees limited details
        return res.json({
            success: true,
            profile: {
                _id: profile._id,
                fullName: profile.fullName
                    ? `${profile.fullName.charAt(0).toUpperCase()} • Premium Match`
                    : "Premium Match",
                age: profile.age,
                gender: profile.gender,
                height: profile.height,
                education: profile.education,
                occupation: profile.occupation,
                city: profile.city,
                state: profile.state,
                caste: profile.caste,
                profilePhoto: profile.showPhotosToMembers === false ? "" : profile.profilePhoto,
                showPhotosToMembers: profile.showPhotosToMembers,
            },
        });

    } catch (error) {
        console.error("Get Profile By ID Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
}; 

// ==========================================
// Check whether user can view a full profile
// Free users -> 5 views only
// Premium/Admin -> unlimited
// ==========================================
export const checkProfileViewAccess = async (req, res) => {
    try {

        // Get logged-in user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Admins have unlimited access
        if (user.role === "admin") {
            return res.json({
                success: true,
                canView: true,
            });
        }

        // Premium members have unlimited access
        if (user.membershipPlan === "premium") {
            return res.json({
                success: true,
                canView: true,
            });
        }

        // Free members can view only 5 profiles
        if (user.profileViewsUsed >= 5) {

            return res.status(403).json({
                success: false,
                canView: false,
                message:
                    "Free members can view only 5 profiles. Please upgrade to Premium.",
            });
        }

        // Increase profile view count
        user.profileViewsUsed += 1;

        await user.save();

        res.json({
            success: true,
            canView: true,
            remainingViews: 5 - user.profileViewsUsed,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const createProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.body.user;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Please login again.",
            });
        }

        const profileData = {
            ...req.body,
            user: userId,
            showPhotosToMembers: toBoolean(req.body.showPhotosToMembers, true),
        };

        if (req.file) {
            profileData.profilePhoto = await uploadProfilePhoto(req.file);
        }

        const existingProfile = await Profile.findOne({ user: userId });

        if (existingProfile) {
            delete profileData.profileNumber;
            const changedFields = getChangedProfileFields(existingProfile, profileData);
            const hasChanges = changedFields.length > 0;
            const shouldHoldForReview = existingProfile.status === "approved" && hasChanges;
            const pendingReviewData = shouldHoldForReview
                ? pickReviewData(profileData, changedFields)
                : existingProfile.pendingReviewData || {};
            const liveUpdateData = shouldHoldForReview
                ? {}
                : {
                    ...profileData,
                    status: hasChanges ? "pending" : existingProfile.status,
                };
            const setPayload = {
                ...liveUpdateData,
                reviewChanges: hasChanges ? changedFields : existingProfile.reviewChanges || [],
                pendingReviewData,
                reviewSubmittedAt: hasChanges ? new Date() : existingProfile.reviewSubmittedAt,
            };
            const updatePayload = {
                $set: setPayload,
            };

            if (hasChanges) {
                updatePayload.$push = {
                    changeHistory: buildChangeHistoryEntry(
                        existingProfile,
                        profileData,
                        changedFields,
                        userId,
                        "user"
                    ),
                };
            }

            const updatedProfile = await Profile.findOneAndUpdate(
                { user: userId },
                updatePayload,
                {
                    new: true,
                    runValidators: true,
                }
            );

            return res.status(200).json({
                success: true,
                message: shouldHoldForReview
                    ? "Your profile changes are under admin review. Your approved profile remains visible until the changes are approved."
                    : "Your profile updates have been submitted and are under admin review.",
                profile: updatedProfile,
            });
        }

        const counter = await Counter.findOneAndUpdate(
            { _id: "profileNumber" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const profileNumber = `PN${String(counter.seq).padStart(6, "0")}`;

        const profile = await Profile.create({
            ...profileData,
            status: "pending",
            profileNumber,
        });

        return res.status(201).json({
            success: true,
            message: "Your profile has been submitted and is under admin review. Once approved, your profile will be activated and visible in search.",
            profile,
        });
    } catch (error) {
        console.error("Create/Update Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to save profile",
        });
    }
};

export const createAdminAssistedProfile = async (req, res) => {
    try {
        const {
            accountFullName,
            mobile,
            email,
            password,
            registeringFor,
            status = "approved",
        } = req.body;

        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedMobile = mobile?.trim();
        const profileFullName = req.body.fullName?.trim() || accountFullName?.trim();
        const gender = req.body.gender;

        if (!profileFullName || !normalizedMobile || !normalizedEmail || !gender || !registeringFor) {
            return res.status(400).json({
                success: false,
                message: "Name, mobile, email, gender and registering for are required",
            });
        }

        const expectedGender = getExpectedGender(registeringFor);

        if (expectedGender && gender !== expectedGender) {
            return res.status(400).json({
                success: false,
                message: `${registeringFor} registration should be selected as ${expectedGender}`,
            });
        }

        if (!/^\d{10}$/.test(normalizedMobile)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10-digit mobile number",
            });
        }

        if (!["approved", "pending", "deactivated"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid profile status",
            });
        }

        let user = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { mobile: normalizedMobile },
            ],
        });
        const temporaryPassword = password?.trim() || `NV${normalizedMobile.slice(-4)}${Date.now().toString().slice(-4)}`;
        const createdNewUser = !user;

        if (createdNewUser) {
            const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

            user = await User.findOneAndUpdate(
                { email: normalizedEmail },
                {
                    $setOnInsert: {
                        fullName: accountFullName?.trim() || profileFullName,
                        mobile: normalizedMobile,
                        email: normalizedEmail,
                        password: hashedPassword,
                        gender,
                        registeringFor,
                        role: "user",
                        status: "approved",
                        isEmailVerified: true,
                        isMobileVerified: true,
                        isActive: true,
                        profileStatus: status,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                }
            );
        } else {
            user.fullName = accountFullName?.trim() || user.fullName || profileFullName;
            user.gender = gender || user.gender;
            user.registeringFor = registeringFor || user.registeringFor;
            user.status = "approved";
            user.isEmailVerified = true;
            user.isMobileVerified = true;
            user.isActive = true;
            user.profileStatus = status;
            await user.save();
        }

        const existingProfile = await Profile.findOne({ user: user._id });
        const profileData = {
            ...req.body,
            user: user._id,
            fullName: profileFullName,
            gender,
            status,
            showPhotosToMembers: toBoolean(req.body.showPhotosToMembers, true),
        };

        delete profileData.accountFullName;
        delete profileData.mobile;
        delete profileData.email;
        delete profileData.password;
        delete profileData.registeringFor;
        delete profileData.profileNumber;

        if (req.files?.profilePhoto?.[0]) {
            profileData.profilePhoto = await uploadProfilePhoto(req.files.profilePhoto[0]);
        }

        const stylishUploads = [
            ["stylishPhoto0", 0],
            ["stylishPhoto1", 1],
        ].filter(([field]) => req.files?.[field]?.[0]);

        if (stylishUploads.length > 0) {
            const stylishPhotos = [...(existingProfile?.stylishPhotos || [])];

            for (const [field, index] of stylishUploads) {
                stylishPhotos[index] = await uploadProfilePhoto(req.files[field][0]);
            }

            profileData.stylishPhotos = stylishPhotos;
        }

        let profile;

        if (existingProfile) {
            profile = await Profile.findOneAndUpdate(
                { user: user._id },
                profileData,
                {
                    new: true,
                    runValidators: true,
                }
            );
        } else {
            const counter = await Counter.findOneAndUpdate(
                { _id: "profileNumber" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );

            profile = await Profile.create({
                ...profileData,
                profileNumber: `PN${String(counter.seq).padStart(6, "0")}`,
            });
        }

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(existingProfile ? 200 : 201).json({
            success: true,
            message: existingProfile
                ? "Assisted profile updated successfully"
                : "Assisted profile created successfully",
            user: safeUser,
            profile,
            temporaryPassword: createdNewUser ? temporaryPassword : undefined,
        });
    } catch (error) {
        console.error("Admin assisted profile error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "A user with this email or mobile already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create assisted profile",
        });
    }
};
export const getProfileByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await Profile.findOne({ user: userId }).populate(
            "user",
            "fullName mobile email gender"
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.json({
            success: true,
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find({ status: "approved" })
            .select(
                "profileNumber fullName age gender education occupation city state caste profilePhoto showPhotosToMembers"
            )
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            profiles: profiles.map((profile) => applyPhotoConsent(profile)),
        });
    } catch (error) {
        console.error("Get profiles error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profiles",
        });
    }
};

export const ProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No photo uploaded",
            });
        }

        const photoPath = await uploadProfilePhoto(req.file);

        const profile = await Profile.findOneAndUpdate(
            { user: req.params.userId },
            { profilePhoto: photoPath },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.json({
            success: true,
            message: "Profile photo uploaded successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const existingProfile = await Profile.findOne({ user: req.params.userId });

        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "showPhotosToMembers")) {
            req.body.showPhotosToMembers = toBoolean(req.body.showPhotosToMembers, true);
        }

        if (req.file) {
            const photoPath = await uploadProfilePhoto(req.file);
            const photoType = req.body.photoType;

            if (photoType === "stylish") {
                const slot = Math.max(0, Math.min(Number(req.body.photoSlot) || 0, 1));
                const stylishPhotos = [...(existingProfile.stylishPhotos || [])];
                stylishPhotos[slot] = photoPath;

                req.body = {
                    stylishPhotos,
                };
            } else {
                req.body.profilePhoto = photoPath;
                delete req.body.photoType;
                delete req.body.photoSlot;
            }
        }

        const changedFields = getChangedProfileFields(existingProfile, req.body);
        const hasChanges = changedFields.length > 0;
        const shouldHoldForReview = existingProfile.status === "approved" && hasChanges && !isAdminUser(req.user);
        const pendingReviewData = shouldHoldForReview
            ? {
                ...(existingProfile.pendingReviewData || {}),
                ...pickReviewData(req.body, changedFields),
            }
            : existingProfile.pendingReviewData || {};
        const liveUpdateData = shouldHoldForReview
            ? {}
            : {
                ...req.body,
                status: hasChanges ? "pending" : existingProfile.status,
            };
        const setPayload = {
            ...liveUpdateData,
            reviewChanges: hasChanges ? changedFields : existingProfile.reviewChanges || [],
            pendingReviewData,
            reviewSubmittedAt: hasChanges ? new Date() : existingProfile.reviewSubmittedAt,
        };
        const updatePayload = {
            $set: setPayload,
        };

        if (hasChanges) {
            updatePayload.$push = {
                changeHistory: buildChangeHistoryEntry(
                    existingProfile,
                    req.body,
                    changedFields,
                    req.user?._id || req.user?.id,
                    isAdminUser(req.user) ? "admin" : "user"
                ),
            };
        }

        const profile = await Profile.findOneAndUpdate(
            { user: req.params.userId },
            updatePayload,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.json({
            success: true,
            message: shouldHoldForReview
                ? "Your profile changes are under admin review. Your approved profile remains visible until the changes are approved."
                : "Profile updated successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateProfileStatus = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { status } = req.body;
        const updates =
            typeof req.body.updates === "string"
                ? JSON.parse(req.body.updates || "{}")
                : req.body.updates || {};

        if (!["approved", "rejected", "pending", "deactivated"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid profile status",
            });
        }

        const allowedUpdateFields = [
            "fullName",
            "gender",
            "dateOfBirth",
            "age",
            "height",
            "maritalStatus",
            "motherTongue",
            "religion",
            "caste",
            "subCaste",
            "gothram",
            "education",
            "occupation",
            "annualIncome",
            "city",
            "state",
            "country",
            "familyDetails",
            "contactPreference",
            "aboutMe",
            "preferredAgeFrom",
            "preferredAgeTo",
            "preferredCaste",
            "preferredLocation",
            "profilePhoto",
            "stylishPhotos",
            "showPhotosToMembers",
        ];
        const numericUpdateFields = ["age", "preferredAgeFrom", "preferredAgeTo"];
        const profileUpdates = {};

        allowedUpdateFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(updates, field)) {
                if (field === "showPhotosToMembers") {
                    profileUpdates[field] = toBoolean(updates[field], true);
                    return;
                }

                if (numericUpdateFields.includes(field)) {
                    profileUpdates[field] =
                        updates[field] === "" || updates[field] === null
                            ? null
                            : Number(updates[field]);
                    return;
                }

                profileUpdates[field] = updates[field];
            }
        });

        if (
            Object.prototype.hasOwnProperty.call(profileUpdates, "gender") &&
            !["Bride", "Groom"].includes(profileUpdates.gender)
        ) {
            return res.status(400).json({
                success: false,
                message: "Gender must be Bride or Groom",
            });
        }

        const invalidNumericField = numericUpdateFields.find((field) =>
            Object.prototype.hasOwnProperty.call(profileUpdates, field) &&
            profileUpdates[field] !== null &&
            Number.isNaN(profileUpdates[field])
        );

        if (invalidNumericField) {
            return res.status(400).json({
                success: false,
                message: `${invalidNumericField} must be a valid number`,
            });
        }

        const existingProfile = await Profile.findById(profileId);

        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        const uploadedPrimaryPhoto = req.files?.profilePhoto?.[0];
        const stylishUploads = [
            ["stylishPhoto0", 0],
            ["stylishPhoto1", 1],
        ].filter(([field]) => req.files?.[field]?.[0]);

        if (uploadedPrimaryPhoto) {
            profileUpdates.profilePhoto = await uploadProfilePhoto(uploadedPrimaryPhoto);
        }

        if (stylishUploads.length > 0) {
            const stylishPhotos = Array.isArray(profileUpdates.stylishPhotos)
                ? [...profileUpdates.stylishPhotos]
                : [...(existingProfile.stylishPhotos || [])];

            for (const [field, index] of stylishUploads) {
                stylishPhotos[index] = await uploadProfilePhoto(req.files[field][0]);
            }

            profileUpdates.stylishPhotos = stylishPhotos;
        }

        const pendingReviewData = existingProfile.pendingReviewData || {};
        const hasPendingChanges = hasPendingProfileChanges(existingProfile);
        const latestReviewChangeEntry = getLatestReviewChangeEntry(existingProfile);
        const legacyRejectData =
            latestReviewChangeEntry?.previousData && Object.keys(pendingReviewData).length === 0
                ? latestReviewChangeEntry.previousData
                : {};
        const isPendingChangeReview = hasPendingChanges;
        const isApplyingPendingReview =
            status === "approved" &&
            Object.keys(profileUpdates).length === 0 &&
            Object.keys(pendingReviewData).length > 0;
        const isRejectingPendingReview = status === "rejected" && isPendingChangeReview;
        const effectiveProfileUpdates = isRejectingPendingReview
            ? legacyRejectData
            : isApplyingPendingReview
                ? pendingReviewData
                : profileUpdates;
        const changedFields = getChangedProfileFields(existingProfile, effectiveProfileUpdates);
        const nextStatus = isRejectingPendingReview ? "approved" : status;
        const setPayload = {
            ...effectiveProfileUpdates,
            status: nextStatus,
            ...(status === "approved" || isRejectingPendingReview
                ? {
                    reviewChanges: [],
                    pendingReviewData: {},
                    reviewSubmittedAt: null,
                }
                : {}),
        };
        const updatePayload = {
            $set: setPayload,
        };

        if (changedFields.length > 0 && !isApplyingPendingReview && !isRejectingPendingReview) {
            updatePayload.$push = {
                changeHistory: buildChangeHistoryEntry(
                    existingProfile,
                    setPayload,
                    changedFields,
                    req.user?._id || req.user?.id,
                    "admin"
                ),
            };
        }

        if (isRejectingPendingReview && latestReviewChangeEntry) {
            const historyIndex = existingProfile.changeHistory.findIndex((entry) =>
                String(entry._id) === String(latestReviewChangeEntry._id)
            );

            if (historyIndex >= 0) {
                updatePayload.$set[`changeHistory.${historyIndex}.revertedAt`] = new Date();
                updatePayload.$set[`changeHistory.${historyIndex}.revertedBy`] = req.user._id;
            }
        }

        const profile = await Profile.findByIdAndUpdate(
            profileId,
            updatePayload,
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        if (Object.prototype.hasOwnProperty.call(effectiveProfileUpdates, "gender")) {
            await User.findByIdAndUpdate(profile.user, {
                gender: effectiveProfileUpdates.gender,
            });
        }

        await User.findByIdAndUpdate(profile.user, {
            profileStatus: nextStatus,
        });

        return res.json({
            success: true,
            message: isRejectingPendingReview
                ? "Profile changes rejected. Approved profile remains visible."
                : isApplyingPendingReview
                    ? "Profile changes approved and applied."
                    : `Profile ${status} successfully`,
            profile,
        });
    } catch (error) {
        console.error("UPDATE PROFILE STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const revertProfileChange = async (req, res) => {
    try {
        const { profileId, changeId } = req.params;
        const profile = await Profile.findById(profileId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        const changeEntry = profile.changeHistory.id(changeId);

        if (!changeEntry) {
            return res.status(404).json({
                success: false,
                message: "Profile change version not found",
            });
        }

        if (changeEntry.revertedAt) {
            return res.status(400).json({
                success: false,
                message: "This change version was already reverted",
            });
        }

        const previousData = changeEntry.previousData || {};
        const changedFields = Object.keys(previousData).filter((field) =>
            reviewTrackedFields.includes(field)
        );

        if (changedFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "This change version has no reversible profile fields",
            });
        }

        const currentData = {};
        changedFields.forEach((field) => {
            currentData[field] = profile[field];
            profile[field] = previousData[field];
        });

        profile.status = "approved";
        profile.reviewChanges = [];
        profile.pendingReviewData = {};
        profile.reviewSubmittedAt = null;
        changeEntry.revertedAt = new Date();
        changeEntry.revertedBy = req.user._id;
        profile.changeHistory.push({
            changedAt: new Date(),
            changedBy: req.user._id,
            source: "revert",
            changedFields,
            previousData: currentData,
            newData: previousData,
        });

        await profile.save();

        if (changedFields.includes("gender")) {
            await User.findByIdAndUpdate(profile.user, {
                gender: profile.gender,
            });
        }

        return res.json({
            success: true,
            message: "Profile restored to the selected previous version",
            profile,
        });
    } catch (error) {
        console.error("REVERT PROFILE CHANGE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to revert profile change",
        });
    }
};
