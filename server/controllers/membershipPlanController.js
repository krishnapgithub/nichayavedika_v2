import {
    getMembershipPlans,
    updateMembershipPlans,
} from "../services/membershipPlanService.js";

export const getPublicMembershipPlans = async (req, res) => {
    try {
        const plans = await getMembershipPlans();

        res.json({
            success: true,
            plans,
        });
    } catch (error) {
        console.error("Get membership plans error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load membership plans.",
        });
    }
};

export const updateAdminMembershipPlans = async (req, res) => {
    try {
        if (req.user?.role !== "super_admin") {
            return res.status(403).json({
                success: false,
                message: "Super admin access only.",
            });
        }

        const setting = await updateMembershipPlans(req.body.plans || {}, req.user._id);

        res.json({
            success: true,
            message: "Membership plan settings updated.",
            plans: setting.plans,
        });
    } catch (error) {
        console.error("Update membership plans error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Unable to update membership plans.",
        });
    }
};
