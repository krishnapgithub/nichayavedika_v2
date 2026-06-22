import { useState } from "react";
import axios from "axios";
import Header from "../components/Header.jsx";

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await Profile.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export default function CreateProfile() {
    const [formData, setFormData] = useState({
        user: "6a39857828603c403e7c71bf",
        dateOfBirth: "",
        age: "",
        height: "",
        education: "",
        occupation: "",
        annualIncome: "",
        caste: "",
        subCaste: "",
        gothram: "",
        city: "",
        state: "",
        aboutMe: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/profiles/create",
                formData
            );

            alert("Profile saved successfully!");
            console.log(response.data);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error saving profile");
        }
    };

    return (
        <>
            <Header />

            <main className="pt-28 bg-rose-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <div className="bg-white rounded-3xl shadow-xl p-8">

                        <h1 className="text-3xl font-bold text-[#800020] text-center">
                            Create Your Profile
                        </h1>

                        <p className="text-center text-gray-500 mt-2 mb-8">
                            Complete your details to find better matches
                        </p>

                        <div className="grid md:grid-cols-2 gap-5">
                            <input name="dateOfBirth" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Date of Birth" />
                            <input name="age" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Age" />
                            <input name="height" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Height" />
                            <input name="education" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Education" />
                            <input name="occupation" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Occupation" />
                            <input name="annualIncome" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Annual Income" />
                            <input name="caste" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Caste" />
                            <input name="subCaste" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Sub Caste" />
                            <input name="gothram" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="Gothram" />
                            <input name="city" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="City" />
                            <input name="state" onChange={handleChange} className="border rounded-xl px-4 py-3" placeholder="State" />
                        </div>

                        <textarea
                            name="aboutMe"
                            onChange={handleChange}
                            className="w-full border rounded-xl px-4 py-3 mt-5"
                            rows="4"
                            placeholder="About Me"
                        />

                        <button
                            onClick={handleSubmit}
                            className="w-full mt-6 bg-[#800020] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0017]"
                        >
                            Save Profile
                        </button>

                    </div>
                </div>
            </main>
        </>
    );
}
