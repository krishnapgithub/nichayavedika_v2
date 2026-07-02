import MembershipPlanSetting from "../models/MembershipPlanSetting.js";

export const DEFAULT_MEMBERSHIP_PLANS = {
    free: {
        label: "Free",
        amount: 0,
        durationDays: 0,
        profileViews: 5,
    },
    premium: {
        label: "Premium",
        amount: 1999,
        durationDays: 90,
        profileViews: 20,
    },
    elite: {
        label: "Elite",
        amount: 4999,
        durationDays: 180,
        profileViews: 40,
    },
};

const normalizePlan = (planKey, input = {}) => {
    const fallback = DEFAULT_MEMBERSHIP_PLANS[planKey];

    return {
        label: String(input.label || fallback.label).trim(),
        amount: Number(input.amount ?? fallback.amount),
        durationDays: Number(input.durationDays ?? fallback.durationDays),
        profileViews: Number(input.profileViews ?? fallback.profileViews),
    };
};

export const sanitizeMembershipPlans = (plans = {}) => {
    const sanitized = {
        free: normalizePlan("free", plans.free),
        premium: normalizePlan("premium", plans.premium),
        elite: normalizePlan("elite", plans.elite),
    };

    sanitized.free.amount = 0;
    sanitized.free.durationDays = 0;

    Object.entries(sanitized).forEach(([planKey, plan]) => {
        if (!plan.label) {
            throw new Error(`${planKey} label is required`);
        }

        ["amount", "durationDays", "profileViews"].forEach((field) => {
            if (!Number.isFinite(plan[field]) || plan[field] < 0) {
                throw new Error(`${planKey} ${field} must be a valid number`);
            }
        });

        if (planKey !== "free" && plan.durationDays < 1) {
            throw new Error(`${planKey} duration must be at least 1 day`);
        }

        plan.amount = Math.round(plan.amount);
        plan.durationDays = Math.round(plan.durationDays);
        plan.profileViews = Math.round(plan.profileViews);
    });

    return sanitized;
};

export const getMembershipPlans = async () => {
    const setting = await MembershipPlanSetting.findOne({ key: "default" }).lean();

    if (!setting?.plans) {
        return DEFAULT_MEMBERSHIP_PLANS;
    }

    return sanitizeMembershipPlans(setting.plans);
};

export const getMembershipPlan = async (planKey) => {
    const plans = await getMembershipPlans();

    return plans[String(planKey || "").toLowerCase()] || null;
};

export const updateMembershipPlans = async (plans, updatedBy) => {
    const sanitizedPlans = sanitizeMembershipPlans(plans);

    return MembershipPlanSetting.findOneAndUpdate(
        { key: "default" },
        {
            key: "default",
            plans: sanitizedPlans,
            updatedBy,
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
        }
    ).lean();
};
