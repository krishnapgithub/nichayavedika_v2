import "../styles/contact.css";
import usePageContent from "../hooks/usePageContent";

export default function Contact() {
    const fallbackContact = [
        {
            title: "Nichaya Vedika Support",
            metaLabel: "Trusted Telugu Matrimony Platform",
            subtitle: "",
            detailLines: [
                "Hyderabad, Telangana",
                "+91 XXXXX XXXXX",
                "info@nichayavedika.com",
                "Mon - Sat, 9:00 AM - 7:00 PM",
            ],
        },
        {
            title: "Connect With Us",
            metaLabel: "Quick Support",
            subtitle: "",
            detailLines: [
                "WhatsApp support available",
                "Facebook updates coming soon",
                "Instagram stories coming soon",
            ],
        },
    ];
    const { items: contactItems } = usePageContent("contact", fallbackContact);

    return (
        <div className="contact-page">
            <div className="contact-container">
                <div className="contact-header">
                    <h1>Contact Us</h1>
                    <p>We are here to help you with Nichaya Vedika support</p>
                </div>

                <div className="contact-grid">
                    <div className="contact-info-card">
                        {contactItems.map((item) => (
                            <div key={item._id || item.title} className="mb-6">
                                <h2>{item.title}</h2>
                                {item.metaLabel && <p className="contact-subtitle">{item.metaLabel}</p>}
                                {item.subtitle && <p className="contact-subtitle">{item.subtitle}</p>}

                                <div className="contact-info">
                                    {(item.detailLines || []).map((line) => (
                                        <p key={line}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="contact-form-card">
                        <h2>Send Message</h2>

                        <form>
                            <input type="text" placeholder="Your Name" />
                            <input type="email" placeholder="Email Address" />
                            <input type="text" placeholder="Subject" />
                            <textarea placeholder="Message" rows="5"></textarea>

                            <button type="button">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
