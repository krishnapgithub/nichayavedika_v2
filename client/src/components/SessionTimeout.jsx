
// SessionTimeout.jsx
import { useEffect, useState } from "react";
import "../styles/sessionTimeout.css";

export default function SessionTimeout({ isLoggedIn, onLogout }) {
  const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(30);

    

        console.log("SessionTimeout Loaded", isLoggedIn);

    

  useEffect(() => {
    if (!isLoggedIn) return;

    let warningTimer;
    let logoutTimer;
    let countdownTimer;

      const resetTimers = () => {

          console.log("Timer Reset");

          setShowWarning(false);
          setCountdown(30);

          clearTimeout(warningTimer);
          clearTimeout(logoutTimer);
          clearInterval(countdownTimer);

          warningTimer = setTimeout(() => {

              console.log("Session warning shown");

              setShowWarning(true);

              countdownTimer = setInterval(() => {
                  setCountdown((prev) => prev - 1);
              }, 1000);

              logoutTimer = setTimeout(() => {
                  console.log("Logging out...");
                  onLogout();
              }, 10000);

          }, 10000);
      };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => window.addEventListener(event, resetTimers));

    resetTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimers));
    };
  }, [isLoggedIn, onLogout]);

  if (!showWarning) return null;

  return (
    <div className="session-overlay">
      <div className="session-popup">
        <h3>Session Expiring Soon</h3>
        <p>Your session will expire in next few seconds.</p>
        <strong>{countdown} seconds remaining</strong>

        <button onClick={() => window.location.reload()}>
          Stay Logged In
        </button>
      </div>
    </div>
  );
}