import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

const modalContent = {
    membership: {
        title: "Membership Plans",
        subtitle: "Choose the right access when you are ready to connect.",
        columns: 3,
        sections: [
            {
                title: "Free",
                price: "₹0",
                items: [
                    "Create profile",
                    "Browse approved profiles",
                    "View limited details",
                    "Contact details hidden",
                ],
            },
            {
                title: "Premium",
                price: "₹1,999 / 3 Months",
                featured: true,
                items: [
                    "Up to 20 profile views",
                    "Send interests",
                    "View contact details",
                    "Priority listing",
                ],
            },
            {
                title: "Elite",
                price: "₹4,999 / 6 Months",
                items: [
                    "Everything in Premium",
                    "Dedicated relationship manager",
                    "Profile boost",
                    "Priority support",
                ],
            },
        ],
    },
    success: {
        title: "Success Stories",
        subtitle: "Real connections. Blessed beginnings.",
        columns: 3,
        sections: [
            {
                title: "Rahul & Swathi",
                price: "Hyderabad",
                items: ["Families connected respectfully through Nichaya Vedika."],
            },
            {
                title: "Sandeep & Lakshmi",
                price: "Vijayawada",
                items: ["A simple, family-friendly journey from search to match."],
            },
            {
                title: "Kiran & Deepika",
                price: "Bengaluru",
                items: ["A trusted platform for Telugu families."],
            },
        ],
    },
    events: {
        title: "Upcoming Events",
        subtitle: "Connect with Telugu families through trusted Nichaya Vedika events.",
        columns: 2,
        sections: [
            {
                title: "Telugu Bride & Groom Meet",
                price: "Coming Soon",
                items: ["Venue: Hyderabad", "Limited seats", "Family-friendly gathering"],
            },
            {
                title: "Online Introduction Event",
                price: "Coming Soon",
                items: ["Venue: Online", "Guided introductions", "Open registration"],
            },
        ],
    },
    muhurthalu: {
        title: "ముహూర్తాలు",
        subtitle: "శుభ ముహూర్తాల సమాచారం, ఈ రోజు తిథి మరియు నక్షత్రము.",
        columns: 3,
        sections: [
            {
                title: "తెలుగు క్యాలెండర్",
                price: "API / Yearly",
                items: ["పంచాంగం", "తెలుగు పండుగలు", "మాసం మరియు పక్షం"],
            },
            {
                title: "వివాహ ముహూర్తాలు",
                price: "Coming Soon",
                items: ["శుభ తేదీలు", "కుటుంబ సంప్రదింపులు", "పంచాంగ వివరాలు"],
            },
            {
                title: "నిశ్చితార్థ ముహూర్తాలు",
                price: "Coming Soon",
                items: ["సరైన రోజు ఎంపిక", "సమయం సూచనలు", "కుటుంబ అనుకూలత"],
            },
        ],
    },
    contact: {
        title: "Contact Us",
        subtitle: "We are here to help you with Nichaya Vedika support.",
        columns: 2,
        sections: [
            {
                title: "Nichaya Vedika Support",
                price: "Trusted Telugu Matrimony Platform",
                items: [
                    "Hyderabad, Telangana",
                    "+91 XXXXX XXXXX",
                    "info@nichayavedika.com",
                    "Mon - Sat, 9:00 AM - 7:00 PM",
                ],
            },
            {
                title: "Connect With Us",
                price: "Quick Support",
                items: [
                    "WhatsApp support available",
                    "Facebook updates coming soon",
                    "Instagram stories coming soon",
                    "Email us for profile or payment help",
                ],
            },
        ],
    },
};

const toDynamicSections = (items) =>
    items.map((item) => ({
        title: item.title,
        price: item.metaLabel || "",
        items: [
            item.subtitle,
            ...(item.detailLines || []),
        ].filter(Boolean),
    }));

const mergeMuhurthaluSections = (items) => {
    const apiSections = toDynamicSections(items);
    const apiTitles = new Set(apiSections.map((section) => section.title));
    const fallbackSections = modalContent.muhurthalu.sections.filter(
        (section) => !apiTitles.has(section.title)
    );

    return [...apiSections, ...fallbackSections];
};

export default function HeaderInfoModal({ type, onClose, isLoggedIn, membershipPlan = "free", onMembershipAction }) {
    const [dynamicSections, setDynamicSections] = useState(null);
    const baseContent = modalContent[type];
    const content = dynamicSections
        ? {
            ...baseContent,
            sections: dynamicSections,
        }
        : baseContent;
    const gridClass = content?.columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
    const normalizedMembershipPlan = membershipPlan?.toString().toLowerCase();
    const shouldShowMembershipAction = (sectionTitle) => {
        if (type !== "membership") return false;
        if (!isLoggedIn) return true;
        if (normalizedMembershipPlan === "elite") return false;
        if (normalizedMembershipPlan === "premium") return sectionTitle === "Elite";
        return sectionTitle !== "Free";
    };

    const getMembershipActionLabel = (sectionTitle) => {
        if (!isLoggedIn) return "Register Free";
        return sectionTitle === "Elite" ? "Choose Elite" : "Choose Premium";
    };

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    useEffect(() => {
        let ignore = false;

        const loadDynamicContent = async () => {
            if (!["success", "events", "muhurthalu", "contact"].includes(type)) {
                setDynamicSections(null);
                return;
            }

            try {
                const res = await axios.get(`${API_BASE_URL}/api/page-content/public/${type}`);
                const items = res.data.items || [];

                if (!ignore) {
                    setDynamicSections(
                        items.length > 0
                            ? type === "muhurthalu"
                                ? mergeMuhurthaluSections(items)
                                : toDynamicSections(items)
                            : null
                    );
                }
            } catch (error) {
                console.error("Load modal content failed:", error);
                if (!ignore) {
                    setDynamicSections(null);
                }
            }
        };

        loadDynamicContent();

        return () => {
            ignore = true;
        };
    }, [type]);

    if (!content) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-6">
            <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-rose-100 bg-white px-5 py-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#800020]">{content.title}</h2>
                        <p className="mt-1 text-sm text-gray-600">{content.subtitle}</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>

                <div className={`grid gap-5 p-5 ${gridClass}`}>
                    {content.sections.map((section) => (
                        <div
                            key={section.title}
                            className={`rounded-2xl border p-5 shadow-sm ${
                                section.featured
                                    ? "border-amber-200 bg-amber-50 text-gray-700"
                                    : "border-rose-100 bg-[#fff8f2] text-gray-700"
                            }`}
                        >
                            {section.featured && (
                                <span className="mb-3 inline-flex rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                    Most Popular
                                </span>
                            )}

                            <h3 className="text-xl font-bold text-[#800020]">{section.title}</h3>
                            <p className={`mt-2 text-lg font-bold ${section.featured ? "text-amber-700" : "text-[#800020]"}`}>
                                {section.price}
                            </p>

                            <ul className="mt-4 space-y-2 text-sm">
                                {section.items.map((item) => (
                                    <li key={item}>✓ {item}</li>
                                ))}
                            </ul>

                            {shouldShowMembershipAction(section.title) && (
                                <button
                                    type="button"
                                    onClick={() => onMembershipAction?.(section.title)}
                                    className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                                        section.featured
                                            ? "bg-[#800020] text-white hover:bg-[#5c0017]"
                                            : "border border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white"
                                    }`}
                                >
                                    {getMembershipActionLabel(section.title)}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
