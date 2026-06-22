
export default function RegisterModal({ isOpen, onClose }) {
    if (!isOpen) return null;

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

                <h2 className="text-3xl font-bold text-center text-[#800020]">
                    Register Free
                </h2>

                <p className="text-center text-gray-500 mt-2">
                    Create your NichayaVedika profile
                </p>

                <div className="mt-8 grid md:grid-cols-2 gap-4">
                    <input className="border rounded-xl px-4 py-3" placeholder="Full Name" />

                    <input className="border rounded-xl px-4 py-3" placeholder="Mobile Number" />

                    <input className="border rounded-xl px-4 py-3" placeholder="Email Address" />

                    <select className="border rounded-xl px-4 py-3">
                        <option>Registering For</option>
                        <option>Self</option>
                        <option>Son</option>
                        <option>Daughter</option>
                        <option>Brother</option>
                        <option>Sister</option>
                    </select>

                    <select className="border rounded-xl px-4 py-3">
                        <option>Gender</option>
                        <option>Bride</option>
                        <option>Groom</option>
                    </select>

                    <input className="border rounded-xl px-4 py-3" placeholder="Password" type="password" />
                </div>

                <button className="w-full mt-6 bg-[#800020] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0017]">
                    Create Account
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <span className="text-[#800020] font-semibold cursor-pointer">
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}