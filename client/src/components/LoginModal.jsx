export default function LoginModal({ isOpen, onClose }) {
    if (!isOpen) return null;

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
                    Login
                </h2>

                <p className="text-center text-gray-500 mt-2">
                    Welcome back to NichayaVedika
                </p>

                <div className="mt-8 space-y-4">
                    <input
                        type="text"
                        placeholder="Email or Mobile Number"
                        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                    />

                    <button className="w-full bg-[#800020] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0017]">
                        Login
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    New to NichayaVedika?{" "}
                    <span className="text-[#800020] font-semibold cursor-pointer">
                        Register Free
                    </span>
                </p>
            </div>
        </div>
    );
}