import "../styles/successStories.css";
import logo from "../images/wedding-hero.png";
import usePageContent from "../hooks/usePageContent";

export default function SuccessStories() {
    const fallbackStories = [
        {
            title: "Rahul & Swathi",
            metaLabel: "Hyderabad",
            subtitle:
                "We found each other through Nichaya Vedika. Thank you for helping our families connect.",
            detailLines: ["Married: 12 Jan 2026"],
        },
        {
            title: "Sandeep & Lakshmi",
            metaLabel: "Vijayawada",
            subtitle:
                "Nichaya Vedika made the search simple, respectful, and family friendly.",
            detailLines: ["Married: 20 Feb 2026"],
        },
        {
            title: "Kiran & Deepika",
            metaLabel: "Bengaluru",
            subtitle:
                "A beautiful platform for Telugu families. We are happy to share our story.",
            detailLines: ["Married: 05 Mar 2026"],
        },
    ];
    const { items: stories } = usePageContent("success", fallbackStories);

    return (
        <div className="success-page">
            <div className="success-container">
                <div className="success-header">
                    <h1>Success Stories</h1>
                    <p>Real connections. Blessed beginnings.</p>
                </div>

                <div className="success-grid">
                    {stories.map((story) => (
                        <div className="success-card" key={story._id || story.title}>
                            <img src={logo} alt="Success Story" />

                            <h2>{story.title}</h2>
                            <p className="story-message">"{story.subtitle}"</p>

                            <div className="story-info">
                                {story.metaLabel && <p>{story.metaLabel}</p>}
                                {(story.detailLines || []).map((line) => (
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
