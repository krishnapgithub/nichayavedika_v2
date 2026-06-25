import { useState } from "react";
import axios from "axios";
import OtpModal from "./OtpModal";
import API_BASE_URL from "../config/api";
import toast from "react-hot-toast";
import { isValidEmail } from "../utils/validation";



export default function RegisterModal({ isOpen, onClose, onLoginSuccess }) {
    const [isOtpOpen, setIsOtpOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        mobile: "",
        email: "",
        registeringFor: "",
        gender: "",
        password: "",
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async () => {

        if (!formData.fullName.trim()) {
            return toast.error("Full Name is required"); //alert("Full Name is required");
        }

        if (!/^\d{10}$/.test(formData.mobile)) {
            return toast.error("Please enter a valid 10-digit mobile number");  //alert("Please enter a valid 10-digit mobile number");
        }

        {/*const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(formData.email)) {
    return toast.error("Please enter a valid email address");
}*/}

        if (!isValidEmail(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        

        if (!formData.registeringFor) {
            return toast.error("Please select Registering For"); //alert("Please select Registering For");
        }

        if (!formData.gender) {
            return toast.error("Please select Gender"); // alert("Please select Gender");
        }

        if (formData.password.length < 6) {
            return toast.error("Password must be at least 6 characters");  //alert("Password must be at least 6 characters");
        }

        try {
            setLoading(true);

            await axios.post(
                `${API_BASE_URL}/auth/send-email-otp`,
                {
                    email: formData.email,
                }
            );

            setIsOtpOpen(true);

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerified = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${API_BASE_URL}/auth/register`,
                formData
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            if (onLoginSuccess) {
                onLoginSuccess(response.data.user);
            }

            setIsOtpOpen(false);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
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
                className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600"
                >
                    ✕
                </button>
                <div className="bg-[#800020] text-white -mx-8 -mt-8 mb-8 px-8 py-6 rounded-t-3xl">
                    <h2 className="text-3xl font-bold text-center">
                        Register Free
                    </h2>

                    <p className="text-center text-gray-200 mt-2">
                        Create your NichayaVedika profile
                    </p>
                </div>

                <div className="mt-8 grid md:grid-cols-2 gap-4">
                    <input name="fullName" value={formData.fullName} onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Full Name" />
                    <input name="mobile" value={formData.mobile} onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Mobile Number" />
                    <input name="email" value={formData.email} onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Email Address" />

                    <select name="registeringFor" value={formData.registeringFor} onChange={handleChange} className="border rounded-xl px-4 py-3">
                        <option value="">Registering For</option>
                        <option value="Self">Self</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                    </select>

                    <select name="gender" value={formData.gender} onChange={handleChange} className="border rounded-xl px-4 py-3">
                        <option value="">Gender</option>
                        <option value="Bride">Bride</option>
                        <option value="Groom">Groom</option>
                    </select>

                    <input name="password" value={formData.password} onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Password" type="password" />
                </div>

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full mt-6 bg-[#800020] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0017] disabled:opacity-60"
                >
                    {loading ? "Please wait..." : "Register & Send Email OTP"}
                </button>
            </div>

            <OtpModal
                isOpen={isOtpOpen}
                onClose={() => setIsOtpOpen(false)}
                email={formData.email}
                onOtpVerified={handleOtpVerified}
            />
        </div>
    );
}