
import "../styles/events.css";
import usePageContent from "../hooks/usePageContent";

export default function Events() {
    const fallbackEvents = [
        {
            title: "Telugu Bride & Groom Meet",
            metaLabel: "Coming Soon",
            subtitle: "A premium family-friendly gathering for Telugu brides, grooms, and parents.",
            detailLines: ["Venue: Hyderabad", "Limited Seats", "+91 XXXXX XXXXX"],
        },
        {
            title: "Online Matrimony Introduction Event",
            metaLabel: "Coming Soon",
            subtitle: "Meet suitable profiles through a guided online introduction session.",
            detailLines: ["Venue: Online", "Open", "info@nichayavedika.com"],
        },
    ];
    const { items: events } = usePageContent("events", fallbackEvents);

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
                                <p className="event-description">{event.subtitle}</p>

                                <div className="event-info">
                                    {event.metaLabel && <p>{event.metaLabel}</p>}
                                    {(event.detailLines || []).map((line) => (
                                        <p key={line}>{line}</p>
                                    ))}
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

