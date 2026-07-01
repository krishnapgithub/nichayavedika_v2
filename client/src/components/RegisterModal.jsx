import { useState } from "react";
import axios from "axios";
import OtpModal from "./OtpModal";

import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import toast from "react-hot-toast";
import { isValidEmail } from "../utils/validation";

const CLOUD_STORAGE_CONSENT_KEY = "cloudStorageConsentAccepted";

const getExpectedGender = (registeringFor) => {
    if (["Son", "Brother"].includes(registeringFor)) return "Groom";
    if (["Daughter", "Sister"].includes(registeringFor)) return "Bride";
    return "";
};

export default function RegisterModal({ isOpen, onClose, onLoginSuccess }) {
    const [isOtpOpen, setIsOtpOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cloudStorageConsent, setCloudStorageConsent] = useState(
        () => localStorage.getItem(CLOUD_STORAGE_CONSENT_KEY) === "true"
    );

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        mobile: "",
        password: "",
        gender: "",
        registeringFor: "",
    });


    const validateRegisterForm = () => {

        if (!formData.fullName.trim()) {
            toast.error("Full Name is required");
            return false;
        }

        if (formData.fullName.length > 220) {
            toast.error("Full Name cannot exceed 200 characters");
            return false;
        }

        if (formData.email.length > 100) {
            toast.error("Email cannot exceed 100 characters");
            return false;
        }
       

        if (!/^\d{10}$/.test(formData.mobile)) {
            toast.error("Please enter a valid 10-digit mobile number");
            return false;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }

        

        if (!isValidEmail(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }

        if (!formData.registeringFor) {
            toast.error("Please select Registering For");
            return false;
        }

        const expectedGender = getExpectedGender(formData.registeringFor);

        if (!expectedGender && !formData.gender) {
            toast.error("Please select Bride or Groom");
            return false;
        }

        return true;
    };

    
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "fullName") {
            setFormData({
                ...formData,
                fullName: value.slice(0, 200),
            });
            return;
        }

        if (name === "mobile") {
            setFormData({
                ...formData,
                mobile: value.replace(/\D/g, "").slice(0, 10),
            });
            return;
        }

        if (name === "email") {
            setFormData({
                ...formData,
                email: value.slice(0, 100),
            });
            return;
        }

        if (name === "password") {
            setFormData({
                ...formData,
                password: value.slice(0, 20),
            });
            return;
        }

        if (name === "registeringFor") {
            setFormData({
                ...formData,
                registeringFor: value,
                gender: getExpectedGender(value),
            });
            return;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleRegister = async () => {
        if (!cloudStorageConsent) {
            toast.error("Please accept the information protection agreement to continue");
            return;
        }

        if (!validateRegisterForm()) return;

        try {
            setLoading(true);

            await axios.post(
                `${API_BASE_URL}${API_ENDPOINTS.SEND_EMAIL_OTP}`,
                {
                    email: formData.email.trim().toLowerCase(),
                    mobile: formData.mobile.trim(),
                }
            );

            setIsOtpOpen(true);
        } catch (error) {
            toast.error(
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

            const profileType = getExpectedGender(formData.registeringFor) || formData.gender;

            const registerPayload = {
                fullName: formData.fullName.trim(),
                mobile: formData.mobile.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                gender: profileType,
                registeringFor: formData.registeringFor,
            };

            console.log("REGISTER PAYLOAD:", registerPayload);

            const response = await axios.post(
                `${API_BASE_URL}${API_ENDPOINTS.REGISTER}`,
                registerPayload
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem(CLOUD_STORAGE_CONSENT_KEY, "true");
            window.dispatchEvent(new Event("account:user-updated"));

            if (typeof onLoginSuccess === "function") {
                onLoginSuccess(response.data.user);
            }

            // ==========================================
            // Registration Success - Pending Admin Approval
            // ==========================================
            toast.success(
                "Registration completed. Your profile is awaiting admin approval."
            );

            setIsOtpOpen(false);
            onClose();


        } catch (error) {
            toast.success(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[99999] flex h-[100dvh] w-screen items-start justify-center overflow-y-auto bg-black/60 px-3 py-4 sm:px-4 sm:py-8"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-4rem)] sm:p-8"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600"
                >
                    ✕
                </button>
                <div className="-mx-5 -mt-5 mb-5 rounded-t-3xl bg-[#800020] px-5 py-5 text-white sm:-mx-8 sm:-mt-8 sm:mb-8 sm:px-8 sm:py-6">
                    <h2 className="text-3xl font-bold text-center">
                        Register Free
                    </h2>

                    <p className="text-center text-gray-200 mt-2">
                        Create your NichayaVedika profile
                    </p>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                        name="fullName"
                        maxLength={200}
                        value={formData.fullName}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Full Name"
                    />

                    <input
                        name="mobile"
                        maxLength={10}
                        inputMode="numeric"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Mobile Number"
                    />

                    <input
                        name="email"
                        type="email"
                        maxLength={100}
                        value={formData.email}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Email Address"
                    />

                    <input
                        name="password"
                        type="password"
                        minLength={6}
                        maxLength={20}
                        value={formData.password}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Password"
                    />
                    <select name="registeringFor" value={formData.registeringFor} onChange={handleChange} className="border rounded-xl px-4 py-3">
                        <option value="">Registering For</option>
                        <option value="Self">Self</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                    </select>

                    {formData.registeringFor === "Self" && (
                        <select name="gender" value={formData.gender} onChange={handleChange} className="border rounded-xl px-4 py-3">
                            <option value="">Bride / Groom</option>
                            <option value="Bride">Bride</option>
                            <option value="Groom">Groom</option>
                        </select>
                    )}

                    
                </div>

                <label className="mt-5 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
                    <input
                        type="checkbox"
                        checked={cloudStorageConsent}
                        onChange={handleCloudStorageConsentChange}
                        className="mt-1 h-5 w-5 accent-[#800020]"
                    />
                    <span>
                        NichayaVedika may store and process my personal information on
                        protected cloud platforms and uses reasonable administrative,
                        technical, and organizational safeguards to protect it while my
                        profile or records are active. Information may be retained as needed
                        for legal, security, or operational purposes after deactivation. I
                        acknowledge this notice and agree to continue.
                        <span className="mt-2 block text-xs text-gray-500">
                            Read our{" "}
                            <a
                                href="/legal"
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-[#800020] hover:underline"
                            >
                                Privacy, Terms & Legal Information
                            </a>
                            {" "}before continuing.
                        </span>
                    </span>
                </label>

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="mt-5 w-full rounded-xl bg-[#800020] py-3 font-semibold text-white hover:bg-[#5c0017] disabled:opacity-60"
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
