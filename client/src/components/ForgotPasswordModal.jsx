import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/api";
import { isValidEmail } from "../utils/validation";

export default function ForgotPasswordModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const closeModal = () => {
        setStep(1);
        setEmail("");
        setOtp("");
        setPassword("");
        onClose();
    };

    const handleSendOtp = async () => {
        if (!isValidEmail(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);

            await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
                email,
            });

            toast.success("OTP sent to your email");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!isValidEmail(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            await axios.post(`${API_BASE_URL}/auth/reset-password`, {
                email,
                otp,
                password,
            });

            toast.success("Password updated successfully. Please login.");
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Password reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
            onClick={closeModal}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
            >
                <button
                    type="button"
                    onClick={closeModal}
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
                    {step === 1 && (
                        <div>
                            <input
                                type="email"
                                placeholder="Enter registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="mb-5 rounded-2xl bg-[#fff4f7] px-5 py-4 text-sm text-[#800020]">
                                OTP has been sent to <strong>{email}</strong>
                            </div>

                            <label className="mb-2 block text-sm font-bold text-[#800020]">
                                Enter OTP
                            </label>

                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                                }
                                className="mb-5 w-full rounded-2xl border border-black px-5 py-4 text-center text-xl tracking-[0.45em] outline-none focus:border-[#99002f]"
                            />

                            <label className="mb-2 block text-sm font-bold text-[#800020]">
                                New Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mb-5 w-full rounded-2xl border border-black px-5 py-4 text-lg outline-none focus:border-[#99002f]"
                            />

                            <button
                                type="button"
                                onClick={handleResetPassword}
                                disabled={loading}
                                className="w-full rounded-xl bg-[#99002f] py-4 text-lg font-bold text-white hover:bg-[#760024] disabled:opacity-60"
                            >
                                {loading ? "Updating..." : "Reset Password"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="mt-4 w-full text-sm font-bold text-[#99002f] hover:underline"
                            >
                                Change email address
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}