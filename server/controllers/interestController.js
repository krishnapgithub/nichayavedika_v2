import Interest from "../models/Interest.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";

const normalizeProfileGender = (gender) => {
    const value = String(gender || "").trim().toLowerCase();

    if (["bride", "female"].includes(value)) return "Bride";
    if (["groom", "male"].includes(value)) return "Groom";
    return "";
};

const isAdminUser = (user) => {
    const role = user?.role?.toLowerCase?.().trim();

    return ["admin", "oper_admin", "super_admin"].includes(role);
};

const normalizeStatus = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "accepted") return "Accepted";
    if (value === "rejected") return "Rejected";
    return "Pending";
};

const normalizeInterest = (interest) => {
    const item = interest.toObject ? interest.toObject() : interest;

    return {
        ...item,
        fromUser: item.fromUser || item.sender,
        toProfile: item.toProfile || item.receiverProfile,
        status: normalizeStatus(item.status),
    };
};

export const sendInterest = async (req, res) => {
    try {
        const senderId = req.body.senderId || req.body.fromUser || req.user?._id;
        const receiverProfileId = req.body.receiverProfileId || req.body.toProfile;

        if (!senderId || !receiverProfileId) {
            return res.status(400).json({
                success: false,
                message: "Sender and profile are required",
            });
        }

        const [sender, receiverProfile] = await Promise.all([
            User.findById(senderId).select("gender role"),
            Profile.findById(receiverProfileId).select("gender"),
        ]);

        if (!sender || !receiverProfile) {
            return res.status(404).json({
                success: false,
                message: "Sender or profile not found",
            });
        }

        const senderGender = normalizeProfileGender(sender.gender);
        const receiverGender = normalizeProfileGender(receiverProfile.gender);

        if (
            !isAdminUser(sender) &&
            senderGender &&
            receiverGender &&
            senderGender === receiverGender
        ) {
            return res.status(400).json({
                success: false,
                message: "Interest can be sent only between bride and groom profiles",
            });
        }

        const existingInterest = await Interest.findOne({
            $or: [
                { sender: senderId, receiverProfile: receiverProfileId },
                { fromUser: senderId, toProfile: receiverProfileId },
            ],
        });

        if (existingInterest) {
            return res.status(400).json({
                success: false,
                message: "Interest already sent to this profile",
            });
        }

        const interest = await Interest.create({
            sender: senderId,
            receiverProfile: receiverProfileId,
            fromUser: senderId,
            toProfile: receiverProfileId,
            status: "Pending",
        });

        res.status(201).json({
            success: true,
            message: "Interest sent successfully",
            interest: normalizeInterest(interest),
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Interest already sent to this profile",
            });
        }

        console.error("Send interest error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send interest",
        });
    }
};

export const getSentInterests = async (req, res) => {
    try {
        const { userId } = req.params;

        const interests = await Interest.find({
            $or: [{ fromUser: userId }, { sender: userId }],
        })
            .populate("toProfile")
            .populate("receiverProfile")
            .sort({ createdAt: -1 });

        const normalizedInterests = interests.map(normalizeInterest);

        res.json({
            success: true,
            count: normalizedInterests.length,
            interests: normalizedInterests,
        });
    } catch (error) {
        console.error("Get sent interests error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch sent interests",
        });
    }
};

export const getReceivedInterests = async (req, res) => {
    try {
        const { userId } = req.params;

        const interests = await Interest.find()
            .populate({
                path: "toProfile",
                match: { user: userId },
            })
            .populate({
                path: "receiverProfile",
                match: { user: userId },
            })
            .populate("fromUser")
            .populate("sender")
            .sort({ createdAt: -1 });

        const normalizedInterests = interests
            .filter((item) => item.toProfile || item.receiverProfile)
            .map(normalizeInterest);

        res.json({
            success: true,
            count: normalizedInterests.length,
            interests: normalizedInterests,
        });
    } catch (error) {
        console.error("Get received interests error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch received interests",
        });
    }
};

export const updateInterestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = normalizeStatus(req.body.status);

        if (!["Accepted", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        const interest = await Interest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: "Interest not found",
            });
        }

        res.json({
            success: true,
            message: `Interest ${status.toLowerCase()} successfully`,
            interest: normalizeInterest(interest),
        });
    } catch (error) {
        console.error("Update interest status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update interest",
        });
    }
};
