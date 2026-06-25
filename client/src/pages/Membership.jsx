
import Header from "../components/Header.jsx";
import "../styles/membership.css";

export default function Membership() {
    return (
        <>
            <Header />

            <div className="membership-page">
                <div className="membership-container">
                    <div className="membership-header">
                        <h1>Membership Plans</h1>
                        <p>Choose the right plan to find your perfect match</p>
                    </div>

                    <div className="membership-grid">
                        <div className="membership-card">
                            <h2>Free</h2>
                            <h3>₹0</h3>
                            <p className="plan-subtitle">Basic access</p>

                            <ul>
                                <li>✓ Browse profiles</li>
                                <li>✓ View limited details</li>
                                <li>✓ 5 profile views</li>
                                <li>✓ Basic search</li>
                            </ul>

                            <button>Current Plan</button>
                        </div>

                        <div className="membership-card premium">
                            <div className="popular-badge">Most Popular</div>

                            <h2>Premium</h2>
                            <h3>₹1,999</h3>
                            <p className="plan-subtitle">3 months validity</p>

                            <ul>
                                <li>✓ Unlimited profile views</li>
                                <li>✓ View contact details</li>
                                <li>✓ Send unlimited interests</li>
                                <li>✓ Advanced search</li>
                                <li>✓ Priority profile listing</li>
                            </ul>

                            <button>Become Premium</button>
                        </div>

                        <div className="membership-card">
                            <h2>Assisted</h2>
                            <h3>₹4,999</h3>
                            <p className="plan-subtitle">Personal support</p>

                            <ul>
                                <li>✓ All Premium features</li>
                                <li>✓ Dedicated relationship support</li>
                                <li>✓ Profile shortlisting help</li>
                                <li>✓ WhatsApp assistance</li>
                                <li>✓ Priority customer support</li>
                            </ul>

                            <button>Contact Us</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}