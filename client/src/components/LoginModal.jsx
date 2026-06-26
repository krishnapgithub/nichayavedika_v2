import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import toast from "react-hot-toast";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { isValidEmail } from "../utils/validation";

export default function LoginModal({ isOpen, onClose }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async () => {


      try {

          if (!isValidEmail(email) || email.length < 0) {
              //alert("Please enter a valid email address");
              toast.error("Please enter a valid email address");
              return;

          }


            if (password.length < 6) {
                //alert("Password must be at least 6 characters");
                toast.error("Password must be at least 6 characters");
                //toast.success("Login successful!");
                return;
            }
            setLoading(true);

            const response = await axios.post(
                `${API_BASE_URL}/api/auth/login`,
                {
                    email,
                    password,
                }
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            alert("Login Successful");

            console.log("Logged In User:", response.data.user);

            onClose();

        } catch (error) {
            alert(
                error.response?.data?.message || "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen z-[99999] bg-black/60 flex items-start justify-center px-4 pt-20"
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

                <div className="bg-[#800020] text-white -mx-8 -mt-8 mb-8 px-8 py-6 rounded-t-3xl">
                    <h2 className="text-3xl font-bold text-center">
                        Login
                    </h2>

                    <p className="text-center text-gray-200 mt-2">
                        Welcome back to NichayaVedika
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border rounded-xl px-4 py-3 w-full"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded-xl px-4 py-3 w-full"
                    />
                    <div className="text-right">
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => setIsForgotOpen(true)}
                                className="text-sm text-[#800020] font-semibold hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-[#800020] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0017] disabled:opacity-60"
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>
                </div>
            </div>
            <ForgotPasswordModal
                isOpen={isForgotOpen}
                onClose={() => setIsForgotOpen(false)}
            />
        </div>
    );
}