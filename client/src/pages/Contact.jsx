import Header from "../components/Header.jsx";
import "../styles/contact.css";

export default function Contact() {
    return (
        <>
            <Header />

            <div className="contact-page">
                <div className="contact-container">
                    <div className="contact-header">
                        <h1>Contact Us</h1>
                        <p>We are here to help you with Nichaya Vedika support</p>
                    </div>

                    <div className="contact-grid">
                        <div className="contact-info-card">
                            <h2>నిశ్చయ వేదిక</h2>
                            <p className="contact-subtitle">Trusted Telugu Matrimony Platform</p>

                            <div className="contact-info">
                                <p>📍 Hyderabad, Telangana</p>
                                <p>📞 +91 XXXXX XXXXX</p>
                                <p>✉️ info@nichayavedika.com</p>
                                <p>🕘 Mon - Sat, 9:00 AM - 7:00 PM</p>
                            </div>

                            <div className="social-links">
                                <button>WhatsApp</button>
                                <button>Facebook</button>
                                <button>Instagram</button>
                            </div>
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
        </>
    );
}