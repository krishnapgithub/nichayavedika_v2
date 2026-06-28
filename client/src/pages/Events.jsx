
import "../styles/events.css";

export default function Events() {
    const events = [
        {
            title: "Telugu Bride & Groom Meet",
            date: "Coming Soon",
            venue: "Hyderabad",
            seats: "Limited Seats",
            contact: "+91 XXXXX XXXXX",
            description: "A premium family-friendly gathering for Telugu brides, grooms, and parents.",
        },
        {
            title: "Online Matrimony Introduction Event",
            date: "Coming Soon",
            venue: "Online",
            seats: "Open",
            contact: "info@nichayavedika.com",
            description: "Meet suitable profiles through a guided online introduction session.",
        },
    ];

    return (
        <>

            <div className="events-page">
                <div className="events-container">
                    <div className="events-header">
                        <h1>Upcoming Events</h1>
                        <p>Connect with Telugu families through trusted Nichaya Vedika events</p>
                    </div>

                    <div className="events-grid">
                        {events.map((event, index) => (
                            <div className="event-card" key={index}>
                                <div className="event-badge">Event</div>

                                <h2>{event.title}</h2>
                                <p className="event-description">{event.description}</p>

                                <div className="event-info">
                                    <p>?? {event.date}</p>
                                    <p>?? {event.venue}</p>
                                    <p>?? {event.seats}</p>
                                    <p>?? {event.contact}</p>
                                </div>

                                <button>Register Interest</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

