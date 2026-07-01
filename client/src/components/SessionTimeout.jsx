
// SessionTimeout.jsx
import { useEffect, useState } from "react";
import "../styles/sessionTimeout.css";

const WARNING_AFTER_MS = 25 * 60 * 1000;
const LOGOUT_AFTER_WARNING_MS = 5 * 60 * 1000;
const WARNING_SECONDS = Math.floor(LOGOUT_AFTER_WARNING_MS / 1000);
const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export default function SessionTimeout({ isLoggedIn, onLogout }) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_SECONDS);

  useEffect(() => {
    if (!isLoggedIn) return;

    let warningTimer;
    let logoutTimer;
    let countdownTimer;

      const resetTimers = () => {

          setShowWarning(false);
          setCountdown(WARNING_SECONDS);

          clearTimeout(warningTimer);
          clearTimeout(logoutTimer);
          clearInterval(countdownTimer);

          warningTimer = setTimeout(() => {

              setShowWarning(true);

              countdownTimer = setInterval(() => {
                  setCountdown((prev) => Math.max(prev - 1, 0));
              }, 1000);

              logoutTimer = setTimeout(() => {
                  onLogout();
              }, LOGOUT_AFTER_WARNING_MS);

          }, WARNING_AFTER_MS);
      };

    activityEvents.forEach((event) => window.addEventListener(event, resetTimers, { passive: true }));

    resetTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownTimer);
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimers));
    };
  }, [isLoggedIn, onLogout]);

  if (!showWarning) return null;

  return (
    <div className="session-overlay">
      <div className="session-popup">
        <h3>Session Expiring Soon</h3>
        <p>Your session will expire soon due to inactivity.</p>
        <strong>{countdown} seconds remaining</strong>

        <button onClick={() => {
          setShowWarning(false);
          setCountdown(WARNING_SECONDS);
          window.dispatchEvent(new Event("mousemove"));
        }}>
          Stay Logged In
        </button>
      </div>
    </div>
  );
}
