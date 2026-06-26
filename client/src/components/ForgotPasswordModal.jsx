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

    const handleSendOtp = async () => {
        if (!isValidEmail(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                `${API_BASE_URL}/auth/forgot-password`,
                { email }
            );

            toast.success("OTP sent to your email");
            setStep(2);

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to send OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {

        if (!isValidEmail(email)) {
           // toast.success("Please enter a valid email address");
            toast.success("Please enter a valid email address");
            return;
        }

        if (otp.length !== 6) {
            toast.success("Please enter a valid 6-digit OTP");
            return;
        }

        if (password.length < 6) {
            toast.success("Password must be at least 6 characters");
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
            onClose();
        } catch (error) {
            toast.success(error.response?.data?.message || "Password reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen z-[100000] bg-black/60 flex items-start justify-center px-4 pt-24"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600"
                >
                    ✕
                </button>

                <div className="bg-[#800020] text-white -mx-8 -mt-8 mb-8 px-8 py-6 rounded-t-[40px] relative z-10">
                    <h2 className="text-2xl font-bold text-center">
                        Forgot Password
                    </h2>
                    <p className="text-center text-gray-200 mt-2 text-sm">
                        Reset your NichayaVedika password
                    </p>
                </div>

                {step === 1 && (
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border rounded-xl px-4 py-3 w-full"
                        />

                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full bg-[#800020] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0017] disabled:opacity-60"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="border rounded-xl px-4 py-3 w-full text-center tracking-[8px] text-xl"
                        />

                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border rounded-xl px-4 py-3 w-full"
                        />

                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full bg-[#800020] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0017] disabled:opacity-60"
                        >
                            {loading ? "Updating..." : "Reset Password"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}