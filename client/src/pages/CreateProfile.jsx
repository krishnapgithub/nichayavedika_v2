import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/api";
import { authHeader } from "../utils/authHeader";

const initialFormData = {
    user: "6a39857828603c403e7c71bf",

    fullName: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    height: "",
    maritalStatus: "Never Married",

    motherTongue: "Telugu",
    religion: "Hindu",
    caste: "",
    subCaste: "",
    gothram: "",

    education: "",
    occupation: "",
    annualIncome: "",

    city: "",
    state: "",
    country: "India",

    familyDetails: "",
    contactPreference: "Phone",
    aboutMe: "",

    preferredAgeFrom: "",
    preferredAgeTo: "",
    preferredCaste: "",
    preferredLocation: "",

    profilePhoto: null,
};

export default function CreateProfile({ onClose }) {
    const [formData, setFormData] = useState(initialFormData);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculateAge = (dob) => {
        if (!dob) return "";

        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "dateOfBirth") {
            setFormData((prev) => ({
                ...prev,
                dateOfBirth: value,
                age: calculateAge(value),
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, JPEG and PNG files are allowed.");
            return;
        }

        const maxSize = 2 * 1024 * 1024;

        if (file.size > maxSize) {
            toast.error("Photo size should be less than 2 MB.");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            profilePhoto: file,
        }));

        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    payload.append(key, value);
                }
            });

            await axios.post(`${API_BASE_URL}/profiles/create`, payload, {
                ...authHeader(),
                headers: {
                    ...authHeader().headers,
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Profile created successfully");
            onClose?.();
        } catch (error) {
            console.log("CREATE PROFILE ERROR:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Failed to create profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-2xl border border-[#800020]/15 bg-[#fff8f2] p-5">
                <h2 className="text-2xl font-bold text-[#800020]">Create Profile</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Fields marked with <span className="font-bold text-red-600">*</span>{" "}
                    are required.
                </p>
            </div>

            <Section title="Basic Information">
                <Input
                    name="fullName"
                    placeholder="Full Name *"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />

                <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    options={[
                        ["", "Select Gender *"],
                        ["Bride", "Bride"],
                        ["Groom", "Groom"],
                    ]}
                />

                <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                />

                <Input
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    readOnly
                    className="bg-gray-100"
                />

                <Input
                    name="height"
                    placeholder="Height * (e.g. 5ft 8in)"
                    value={formData.height}
                    onChange={handleChange}
                    required
                />

                <Select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    options={[
                        ["Never Married", "Never Married"],
                        ["Divorced", "Divorced"],
                        ["Widowed", "Widowed"],
                    ]}
                />

                <Input
                    name="motherTongue"
                    placeholder="Mother Tongue"
                    value={formData.motherTongue}
                    onChange={handleChange}
                />
            </Section>

            <Section title="Community Information">
                <Input
                    name="religion"
                    placeholder="Religion"
                    value={formData.religion}
                    onChange={handleChange}
                />

                <Input
                    name="caste"
                    placeholder="Caste *"
                    value={formData.caste}
                    onChange={handleChange}
                    required
                />

                <Input
                    name="subCaste"
                    placeholder="Sub Caste"
                    value={formData.subCaste}
                    onChange={handleChange}
                />

                <Input
                    name="gothram"
                    placeholder="Gothram"
                    value={formData.gothram}
                    onChange={handleChange}
                />
            </Section>

            <Section title="Education & Career">
                <Input
                    name="education"
                    placeholder="Education *"
                    value={formData.education}
                    onChange={handleChange}
                    required
                />

                <Input
                    name="occupation"
                    placeholder="Occupation *"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                />

                <Input
                    name="annualIncome"
                    placeholder="Annual Income"
                    value={formData.annualIncome}
                    onChange={handleChange}
                />
            </Section>

            <Section title="Location">
                <Input
                    name="city"
                    placeholder="City *"
                    value={formData.city}
                    onChange={handleChange}
                    required
                />

                <Input
                    name="state"
                    placeholder="State *"
                    value={formData.state}
                    onChange={handleChange}
                    required
                />

                <Input
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                />
            </Section>

            <Section title="About Me">
                <Textarea
                    name="aboutMe"
                    placeholder="Write a short profile summary"
                    value={formData.aboutMe}
                    onChange={handleChange}
                />
            </Section>

            <Section title="Partner Preferences">
                <Input
                    name="preferredAgeFrom"
                    placeholder="Preferred Age From"
                    value={formData.preferredAgeFrom}
                    onChange={handleChange}
                />

                <Input
                    name="preferredAgeTo"
                    placeholder="Preferred Age To"
                    value={formData.preferredAgeTo}
                    onChange={handleChange}
                />

                <Input
                    name="preferredCaste"
                    placeholder="Preferred Caste"
                    value={formData.preferredCaste}
                    onChange={handleChange}
                />

                <Input
                    name="preferredLocation"
                    placeholder="Preferred Location"
                    value={formData.preferredLocation}
                    onChange={handleChange}
                />
            </Section>

            <Section title="Family & Contact">
                <Textarea
                    name="familyDetails"
                    placeholder="Family Details"
                    value={formData.familyDetails}
                    onChange={handleChange}
                />

                <Select
                    name="contactPreference"
                    value={formData.contactPreference}
                    onChange={handleChange}
                    options={[
                        ["Phone", "Phone"],
                        ["WhatsApp", "WhatsApp"],
                        ["Email", "Email"],
                        ["Any", "Any"],
                    ]}
                />
            </Section>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-1 text-lg font-bold text-[#800020]">
                    Profile Photo <span className="text-red-600">*</span>
                </h3>

                <p className="mb-4 text-sm text-gray-500">
                    Accepted formats: JPG, JPEG, PNG. Maximum size: 2 MB.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-[#800020] bg-gray-100">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Profile preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-400">
                                Photo
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handlePhotoChange}
                        required={!photoPreview}
                        className="w-full rounded-xl border border-gray-300 p-3 text-sm sm:max-w-sm"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#800020] py-4 text-lg font-bold text-white shadow-lg hover:bg-[#5c0017] disabled:opacity-60"
            >
                {loading ? "Saving Profile..." : "Save Profile"}
            </button>
        </form>
    );
}

function Section({ title, children }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[#800020]">{title}</h3>
            <div className="grid gap-4 md:grid-cols-2">{children}</div>
        </section>
    );
}

function Input({ className = "", ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 ${className}`}
        />
    );
}

function Select({ options, className = "", ...props }) {
    return (
        <select
            {...props}
            className={`w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 ${className}`}
        >
            {options.map(([value, label]) => (
                <option key={value || label} value={value}>
                    {label}
                </option>
            ))}
        </select>
    );
}

function Textarea({ className = "", ...props }) {
    return (
        <textarea
            {...props}
            rows="4"
            className={`w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 md:col-span-2 ${className}`}
        />
    );
}