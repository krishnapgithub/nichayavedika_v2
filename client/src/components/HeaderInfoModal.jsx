import { useEffect } from "react";

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
        subtitle: "శుభ ముహూర్తాల సమాచారం త్వరలో అందుబాటులో ఉంటుంది.",
        columns: 2,
        sections: [
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

export default function HeaderInfoModal({ type, onClose }) {
    const content = modalContent[type];
    const gridClass = content?.columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    if (!content) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-6">
            <div className="min-h-[420px] w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-rose-100 bg-gradient-to-r from-[#800020] to-[#a1123e] px-6 py-5 text-white">
                    <div>
                        <h2 className="text-3xl font-bold">{content.title}</h2>
                        <p className="mt-1 text-sm text-white/90">{content.subtitle}</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#800020]"
                    >
                        Close
                    </button>
                </div>

                <div className={`grid gap-5 p-6 ${gridClass}`}>
                    {content.sections.map((section) => (
                        <div
                            key={section.title}
                            className={`rounded-2xl border p-5 shadow-sm ${
                                section.featured
                                    ? "border-[#800020] bg-[#800020] text-white"
                                    : "border-rose-100 bg-[#fff8f2]"
                            }`}
                        >
                            {section.featured && (
                                <span className="mb-3 inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-[#800020]">
                                    Most Popular
                                </span>
                            )}

                            <h3 className="text-xl font-bold">{section.title}</h3>
                            <p className={`mt-2 text-lg font-bold ${section.featured ? "text-amber-200" : "text-[#800020]"}`}>
                                {section.price}
                            </p>

                            <ul className="mt-4 space-y-2 text-sm">
                                {section.items.map((item) => (
                                    <li key={item}>✓ {item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
