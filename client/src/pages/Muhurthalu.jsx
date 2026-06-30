import "../styles/events.css";
import usePageContent from "../hooks/usePageContent";

export default function Muhurthalu() {
    const fallbackItems = [
        {
            title: "Vivaha Muhurthalu",
            metaLabel: "Coming Soon",
            subtitle: "Auspicious wedding dates and guidance will be available soon.",
            detailLines: ["Wedding dates", "Family consultation", "Panchangam details"],
        },
        {
            title: "Engagement Muhurthalu",
            metaLabel: "Coming Soon",
            subtitle: "Engagement date guidance for families.",
            detailLines: ["Date selection", "Time guidance", "Family suitability"],
        },
    ];
    const { items } = usePageContent("muhurthalu", fallbackItems);

    return (
        <div className="events-page">
            <div className="events-container">
                <div className="events-header">
                    <h1>Muhurthalu</h1>
                    <p>Auspicious date information for Telugu families</p>
                </div>

                <div className="events-grid">
                    {items.map((item) => (
                        <div className="event-card" key={item._id || item.title}>
                            <div className="event-badge">Muhurtham</div>
                            <h2>{item.title}</h2>
                            <p className="event-description">{item.subtitle}</p>

                            <div className="event-info">
                                {item.metaLabel && <p>{item.metaLabel}</p>}
                                {(item.detailLines || []).map((line) => (
                                    <p key={line}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
