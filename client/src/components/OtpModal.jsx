import { useState } from "react";
import axios from "axios";


import { API_BASE_URL } from "../config/api";

export default function OtpModal({
    isOpen,
    onClose,
    email,
    onOtpVerified,
}) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleVerifyOtp = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${API_BASE_URL}/api/auth/verify-email-otp`,
                {
                    email,
                    otp,
                }
            );

            //toast.success(response.data.message);

            if (onOtpVerified) {
                await onOtpVerified();
            }

        } catch (error) {
            toast.success(
                error.response?.data?.message ||
                "OTP verification failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen z-[99999] bg-black/60 flex items-start justify-center px-4 pt-24"
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

                <h2 className="text-3xl font-bold text-center text-[#800020]">
                    Verify Email OTP
                </h2>

                <p className="text-center text-gray-500 mt-2">
                    OTP sent to {email || "your email address"}
                </p>

                <div className="mt-8">
                    <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6 digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full text-center tracking-[10px] text-2xl border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                    />

                    <button
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length !== 6}
                        className="w-full mt-5 bg-[#800020] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0017] disabled:opacity-60"
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Didn’t receive OTP?{" "}
                        <span className="text-[#800020] font-semibold cursor-pointer">
                            Resend
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}