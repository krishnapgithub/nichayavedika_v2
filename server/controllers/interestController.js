import Interest from "../models/Interest.js";

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