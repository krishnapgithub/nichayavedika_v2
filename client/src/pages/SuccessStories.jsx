import "../styles/successStories.css";
import logo from "../images/wedding-hero.png";

export default function SuccessStories() {
  const stories = [
    {
      names: "Rahul ?? Swathi",
      location: "Hyderabad",
      date: "12 Jan 2026",
      message:
        "We found each other through Nichaya Vedika. Thank you for helping our families connect.",
    },
    {
      names: "Sandeep ?? Lakshmi",
      location: "Vijayawada",
      date: "20 Feb 2026",
      message:
        "Nichaya Vedika made the search simple, respectful, and family friendly.",
    },
    {
      names: "Kiran ?? Deepika",
      location: "Bengaluru",
      date: "05 Mar 2026",
      message:
        "A beautiful platform for Telugu families. We are happy to share our story.",
    },
  ];

  return (
    <>

      <div className="success-page">
        <div className="success-container">
          <div className="success-header">
            <h1>Success Stories</h1>
            <p>Real connections. Blessed beginnings.</p>
          </div>

          <div className="success-grid">
            {stories.map((story, index) => (
              <div className="success-card" key={index}>
                <img src={logo} alt="Success Story" />

                <h2>{story.names}</h2>
                <p className="story-message">“{story.message}”</p>

                <div className="story-info">
                  <p>?? {story.location}</p>
                  <p>?? Married: {story.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

