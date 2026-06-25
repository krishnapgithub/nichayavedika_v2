import Interest from "../models/Interest.js";

export const updateInterestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

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
            interest,
        });
    } catch (error) {
        console.error("Update interest status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update interest",
        });
    }
};

export const getSentInterests = async (req, res) => {
    try {
        const { userId } = req.params;

        const interests = await Interest.find({ fromUser: userId })
            .populate("toProfile")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: interests.length,
            interests,
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
            .populate("fromUser")
            .sort({ createdAt: -1 });

        const filteredInterests = interests.filter(
            (item) => item.toProfile !== null
        );

        res.json({
            success: true,
            count: filteredInterests.length,
            interests: filteredInterests,
        });
    } catch (error) {
        console.error("Get received interests error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch received interests",
        });
    }
};

export const sendInterest = async (req, res) => {
    try {
        const { fromUser, toProfile } = req.body;

        if (!fromUser || !toProfile) {
            return res.status(400).json({
                success: false,
                message: "fromUser and toProfile are required",
            });
        }

        const existingInterest = await Interest.findOne({
            fromUser,
            toProfile,
        });

        if (existingInterest) {
            return res.status(409).json({
                success: false,
                message: "Interest already sent",
            });
        }

        const interest = await Interest.create({
            fromUser,
            toProfile,
        });

        res.status(201).json({
            success: true,
            message: "Interest sent successfully",
            interest,
        });
    } catch (error) {
        console.error("Send interest error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send interest",
        });
    }
};