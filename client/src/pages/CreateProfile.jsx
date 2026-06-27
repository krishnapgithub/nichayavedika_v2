import { useEffect, useState } from "react";
import axios from "axios";

import { API_BASE_URL } from "../config/api";
import { authHeader } from "../utils/authHeader";



export default function CreateProfile({ onClose }) {


    const [formData, setFormData] = useState({

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
    });

    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.type)) {
            //toast.success("Only JPG, JPEG and PNG files are allowed.");
            return;
        }

        const maxSize = 2 * 1024 * 1024; // 2MB

        if (file.size > maxSize) {
            //toast.success("Photo size should be less than 2 MB.");
            return;
        }

        setFormData({
            ...formData,
            profilePhoto: file,
        });

        setPhotoPreview(URL.createObjectURL(file));
    };



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
            setFormData({
                ...formData,
                dateOfBirth: value,
                age: calculateAge(value),
            });
            return;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();



        try {
            const payload = new FormData();

            Object.keys(formData).forEach((key) => {
                payload.append(key, formData[key]);
            });



            await axios.post(
                `${API_BASE_URL}/profiles/create`,
                formData,
                authHeader()
            );


            //toast.success("Profile Created Successfully");
            onClose();
        } catch (error) {
            console.log("FULL ERROR:", error);
            console.log("BACKEND ERROR:", error.response?.data);

            //toast.success(error.response?.data?.message || "Failed to create profile");
        }
    };
    return (


        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <p className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                Fields marked with <strong>*</strong> are required to create your profile.
            </p>
            <h3 className="md:col-span-2 font-bold text-[#800020]">
                Basic Information
            </h3>

            <input
                name="fullName"
                placeholder="Full Name *"
                className="border p-3 rounded-lg"
                value={formData.fullName}
                onChange={handleChange}
                required
            />

            <select
                name="gender"
                className="border p-3 rounded-lg"
                value={formData.gender}
                onChange={handleChange}
                required
            >
                <option value="">Select Gender *</option>
                <option value="Bride">Bride</option>
                <option value="Groom">Groom</option>
            </select>


            <input
                type="date"
                name="dateOfBirth"
                className="border p-3 rounded-lg"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
            />

            <input
                name="age"
                placeholder="Age"
                className="border p-3 rounded-lg bg-gray-100"
                value={formData.age}
                readOnly
            />

            <input
                name="height"
                placeholder="Height * (e.g. 5ft 8in)"
                className="border p-3 rounded-lg"
                value={formData.height}
                onChange={handleChange}
                required
            />

            <select
                name="maritalStatus"
                className="border p-3 rounded-lg"
                value={formData.maritalStatus}
                onChange={handleChange}
            >
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
            </select>

            <input
                name="motherTongue"
                placeholder="Mother Tongue"
                className="border p-3 rounded-lg"
                value={formData.motherTongue}
                onChange={handleChange}
            />
            <h3 className="md:col-span-2 font-bold text-[#800020] mt-4">
                Community Information
            </h3>

            <input name="religion" placeholder="Religion" className="border p-3 rounded-lg" value={formData.religion} onChange={handleChange} />
            <input
                name="caste"
                placeholder="Caste *"
                className="border p-3 rounded-lg"
                value={formData.caste}
                onChange={handleChange}
                required
            />

            <input name="subCaste" placeholder="Sub Caste" className="border p-3 rounded-lg" value={formData.subCaste} onChange={handleChange} />
            <input name="gothram" placeholder="Gothram" className="border p-3 rounded-lg" value={formData.gothram} onChange={handleChange} />

            <h3 className="md:col-span-2 font-bold text-[#800020] mt-4">
                Education & Career
            </h3>

            <input
                name="education"
                placeholder="Education *"
                className="border p-3 rounded-lg"
                value={formData.education}
                onChange={handleChange}
                required
            />

            <input
                name="occupation"
                placeholder="Occupation *"
                className="border p-3 rounded-lg"
                value={formData.occupation}
                onChange={handleChange}
                required
            />
            <input name="annualIncome" placeholder="Annual Income" className="border p-3 rounded-lg" value={formData.annualIncome} onChange={handleChange} />

            <h3 className="md:col-span-2 font-bold text-[#800020] mt-4">
                Location
            </h3>

            <input
                name="city"
                placeholder="City *"
                className="border p-3 rounded-lg"
                value={formData.city}
                onChange={handleChange}
                required
            />

            <input
                name="state"
                placeholder="State *"
                className="border p-3 rounded-lg"
                value={formData.state}
                onChange={handleChange}
                required
            />
            <input name="country" placeholder="Country" className="border p-3 rounded-lg" value={formData.country} onChange={handleChange} />

            <h3 className="md:col-span-2 font-bold text-[#800020] mt-4">
                About Me
            </h3>

            <textarea name="aboutMe" placeholder="About Me" rows="4" className="border p-3 rounded-lg md:col-span-2" value={formData.aboutMe} onChange={handleChange} />

            <h3 className="md:col-span-2 font-bold text-[#800020] mt-4">
                Partner Preferences
            </h3>

            <input name="preferredAgeFrom" placeholder="Preferred Age From" className="border p-3 rounded-lg" value={formData.preferredAgeFrom} onChange={handleChange} />
            <input name="preferredAgeTo" placeholder="Preferred Age To" className="border p-3 rounded-lg" value={formData.preferredAgeTo} onChange={handleChange} />
            <input name="preferredCaste" placeholder="Preferred Caste" className="border p-3 rounded-lg" value={formData.preferredCaste} onChange={handleChange} />
            <input name="preferredLocation" placeholder="Preferred Location" className="border p-3 rounded-lg" value={formData.preferredLocation} onChange={handleChange} />



            <h3 className="md:col-span-2 font-bold text-[#800020] mt-4">
                Family Details
            </h3>

            <textarea
                name="familyDetails"
                placeholder="Family Details"
                rows="3"
                className="border p-3 rounded-lg md:col-span-2"
                value={formData.familyDetails}
                onChange={handleChange}
            />

            <h3 className="md:col-span-2 font-bold text-[#800020] mt-4">
                Contact Preference
            </h3>

            <p className="md:col-span-2 text-sm text-gray-500 -mt-2">
                How would you prefer prospective matches to contact you?
            </p>

            <select
                name="contactPreference"
                className="border p-3 rounded-lg"
                value={formData.contactPreference}
                onChange={handleChange}
            >
                <option value="Phone">Phone</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="Any">Any</option>
            </select>

            <h3 className="md:col-span-2 font-bold text-[#800020] mt-4">
                Profile Photo
            </h3>

            <p className="md:col-span-2 text-sm text-gray-500 -mt-2">
                Upload a clear profile photo. <span className="text-red-600">*</span> Required
            </p>
            <p className="text-xs text-gray-500">
                Accepted formats: JPG, JPEG, PNG • Maximum size: 2 MB
            </p>
            <div className="md:col-span-2 flex flex-col items-center gap-3">

                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#800020] bg-gray-100">
                    {photoPreview ? (
                        <img
                            src={photoPreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Photo
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    required={!photoPreview}
                    className="text-sm"
                />

            </div>

            <button type="submit" className="md:col-span-2 bg-[#800020] text-white py-3 rounded-xl font-semibold mt-4">
                Save Profile
            </button>
        </form>

    );
}