import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import toast from "react-hot-toast";
import { isValidEmail } from "../utils/validation";

const CLOUD_STORAGE_CONSENT_KEY = "cloudStorageConsentAccepted";

export default function LoginModal({ isOpen, onClose, setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [cloudStorageConsent, setCloudStorageConsent] = useState(
        () => localStorage.getItem(CLOUD_STORAGE_CONSENT_KEY) === "true"
    );

    const [forgotEmail, setForgotEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    if (!isOpen) return null;

    const handleCloudStorageConsentChange = (e) => {
        const isAccepted = e.target.checked;
        setCloudStorageConsent(isAccepted);

        if (isAccepted) {
            localStorage.setItem(CLOUD_STORAGE_CONSENT_KEY, "true");
        } else {
            localStorage.removeItem(CLOUD_STORAGE_CONSENT_KEY);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            if (!cloudStorageConsent) {
                toast.error("Please accept the information protection agreement to continue");
                return;
            }

            if (!isValidEmail(email)) {
                toast.error("Please enter a valid email address");
                return;
            }

            if (password.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
            }

            setLoading(true);

            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password,
            });

            if (!res.data.success) {
                toast.error(res.data.message || "Login failed");
                return;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem(CLOUD_STORAGE_CONSENT_KEY, "true");

            if (typeof setUser === "function") {
                setUser(res.data.user);
            }

            toast.success("Login successful!");
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";

            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("membershipPlan");

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        try {
            if (!isValidEmail(forgotEmail)) {
                toast.error("Please enter a valid email address");
                return;
            }

            setLoading(true);

            await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
                email: forgotEmail,
            });

            setOtpSent(true);
            toast.success("OTP sent to your email");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        try {
            if (!otp.trim()) {
                toast.error("Please enter OTP");
                return;
            }

            if (newPassword.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
            }

            setLoading(true);

            await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                email: forgotEmail,
                otp,
                newPassword,
            });

            toast.success("Password reset successfully");

            setIsForgotOpen(false);
            setOtpSent(false);
            setForgotEmail("");
            setOtp("");
            setNewPassword("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl text-gray-700 shadow hover:bg-gray-100"
                    >
                        ×
                    </button>

                    <div className="select-none bg-[#99002f] px-8 py-8 text-center text-white">
                        <h2 className="text-4xl font-bold">Login</h2>
                        <p className="mt-3 text-lg">Welcome back to NichayaVedika</p>
                    </div>

                    <form onSubmit={handleLogin} className="p-8">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mb-5 w-full rounded-2xl border border-black px-5 py-4 text-lg outline-none focus:border-[#99002f]"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 w-full rounded-2xl border border-black px-5 py-4 text-lg outline-none focus:border-[#99002f]"
                        />

                        <label className="mb-5 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
                            <input
                                type="checkbox"
                                checked={cloudStorageConsent}
                                onChange={handleCloudStorageConsentChange}
                                className="mt-1 h-5 w-5 accent-[#99002f]"
                            />
                            <span>
                                NichayaVedika may store and process my personal information on
                                protected cloud platforms and uses reasonable administrative,
                                technical, and organizational safeguards to protect it while my
                                profile or records are active. Information may be retained as
                                needed for legal, security, or operational purposes after
                                deactivation. I acknowledge this notice and agree to continue.
                                <span className="mt-2 block text-xs text-gray-500">
                                    Read our{" "}
                                    <a
                                        href="/legal"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-semibold text-[#99002f] hover:underline"
                                    >
                                        Privacy, Terms & Legal Information
                                    </a>
                                    {" "}before continuing.
                                </span>
                            </span>
                        </label>

                        <div className="mb-6 text-right">
                            <button
                                type="button"
                                onClick={() => setIsForgotOpen(true)}
                                className="font-bold text-[#99002f] hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-[#99002f] py-4 text-lg font-bold text-white hover:bg-[#760024] disabled:opacity-60"
                        >
                            {loading ? "Logging In..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>

            {isForgotOpen && (
                <div
                    className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
                    onClick={() => setIsForgotOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
                    >
                        <button
                            type="button"
                            onClick={() => setIsForgotOpen(false)}
                            className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl text-gray-700 shadow hover:bg-gray-100"
                        >
                            ×
                        </button>

                        <div className="select-none bg-[#99002f] px-8 py-8 text-center text-white">
                            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                                Forgot Password
                            </h2>
                            <p className="mt-3 text-base sm:text-lg">
                                Reset your NichayaVedika password
                            </p>
                        </div>

                        <div className="p-8">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                className="mb-5 w-full rounded-2xl border border-black px-5 py-4 text-lg outline-none focus:border-[#99002f]"
                            />

                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="w-full rounded-xl bg-[#99002f] py-4 text-lg font-bold text-white hover:bg-[#760024] disabled:opacity-60"
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>

                            {otpSent && (
                                <div className="mt-8">
                                    <label className="mb-2 block text-sm font-bold text-[#800020]">
                                        Enter OTP
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="mb-5 w-full rounded-2xl border border-black px-5 py-4 text-center text-lg tracking-[0.35em] outline-none focus:border-[#99002f]"
                                    />

                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="mb-5 w-full rounded-2xl border border-black px-5 py-4 text-lg outline-none focus:border-[#99002f]"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        disabled={loading}
                                        className="w-full rounded-xl bg-[#99002f] py-4 text-lg font-bold text-white hover:bg-[#760024] disabled:opacity-60"
                                    >
                                        {loading ? "Resetting..." : "Reset Password"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
