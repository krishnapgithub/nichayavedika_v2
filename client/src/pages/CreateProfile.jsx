import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header.jsx";
import toast from "react-hot-toast";

//const USER_ID = "6a39857828603c403e7c71bf";

const user = JSON.parse(localStorage.getItem("user"));
const USER_ID = user?._id || "6a39857828603c403e7c71bf";


export default function CreateProfile({ isModal = false, onClose }) {



    
    const [formData, setFormData] = useState({
        user: USER_ID,
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

    const fetchProfile = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/profiles/user/${USER_ID}`
            );

            const profile = response.data.profile;

            setFormData({
                ...profile,
                user: USER_ID,
            });

            console.log("Profile Loaded");
        } catch (error) {
            console.log("No profile found");
        }
    };

    useEffect(() => {
        if (USER_ID) {
            fetchProfile();
        }
    }, [USER_ID]);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        
    };

    const handleSubmit = async () => {
        try {

            let response;

            if (formData._id) {
                response = await axios.put(
                    `${API_BASE_URL}/profiles/user/${USER_ID}`,
                    formData
                );
            } else {
                response = await axios.post(
                    "${API_BASE_URL}/profiles/create",
                    formData
                );
            }

            //alert(response.data.message);
            toast.success(response.data.message);

            if (onClose) {
                onClose();
            }

        } catch (error) {
            console.error(error);
            //alert(
              //  error.response?.data?.message ||
              //  "Error saving profile"
            //);
            toast.error(
                error.response?.data?.message || "Error saving profile"
            );
        }
    };


    const [preview, setPreview] = useState("");
    const [photoFile, setPhotoFile] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setPhotoFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handlePhotoUpload = async () => {
        try {
            const data = new FormData();
            data.append("profilePhoto", photoFile);

            const response = await axios.put(
                `${API_BASE_URL}/profiles/user/${USER_ID}/photo`,
                data
            );

            toast.success(response.data.message);
            setFormData(response.data.profile);
        } catch (error) {
            toast.error("Photo upload failed");
        }
    };


    return (
        <>
            {!isModal && <Header />}

            <main className={isModal ? "" : "pt-28 bg-rose-50 min-h-screen"}>
                <div className={isModal ? "w-full" : "max-w-6xl mx-auto px-6 py-10"}>
                    <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">

                        <div className="bg-gradient-to-r from-[#800020] to-[#b11246] px-8 py-4 text-center">
                            <h1 className="text-3xl font-bold text-white">
                                {USER_ID && formData._id
                                    ? "Update Your Profile"
                                    : "Create Your Profile"}
                            </h1>
                            <p className="text-rose-100 mt-1 text-sm">
                                Complete your details to find better Telugu matches
                            </p>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <div className="w-20 h-20 rounded-full bg-rose-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center ring-4 ring-rose-100">
                                    {preview || formData.profilePhoto ? (
                                        <img
                                            src={preview || formData.profilePhoto}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-sm">No Photo</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-center gap-6 mb-4">
                                    <label className="cursor-pointer border border-[#800020] text-[#800020] px-5 py-2 rounded-xl text-sm font-semibold text-center hover:bg-rose-50">
                                        Choose Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handlePhotoUpload}
                                        className="text-sm bg-[#800020] text-white px-5 py-2 rounded-xl hover:bg-[#5c0017]"
                                    >
                                        Upload Photo
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" />

                                <input name="age" value={formData.age} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="Age" />

                                <input name="height" value={formData.height} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="Height" />

                                <input name="education" value={formData.education} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="Education" />

                                <input name="occupation" value={formData.occupation} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="Occupation" />

                                <input name="annualIncome" value={formData.annualIncome} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="Annual Income" />

                                <input name="caste" value={formData.caste} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="Caste" />

                                <input name="subCaste" value={formData.subCaste} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="Sub Caste" />

                                <input name="gothram" value={formData.gothram} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="Gothram" />

                                <input name="city" value={formData.city} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="City" />

                                <input name="state" value={formData.state} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]" placeholder="State" />
                            </div>

                            <textarea
                                name="aboutMe"
                                value={formData.aboutMe}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-8 bg-white focus:outline-none focus:ring-2 focus:ring-[#800020] mt-4"
                                rows="1"
                                placeholder="About Me"
                            />

                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={handleSubmit}
                                    className="bg-gradient-to-r from-[#800020] to-[#b11246] text-white px-8 py-2 rounded-xl font-semibold hover:shadow-xl transition"
                                >
                                    {USER_ID && formData._id
                                        ? "Update Profile"
                                        : "Save Profile"}
                                </button>
                            </div>


                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}