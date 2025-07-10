import { useState } from "react";
import { X, Coffee } from "lucide-react";

const FloatingBuyMeCoffeeButton = ({
  qrImageSrc = "https://res.cloudinary.com/dqwosfxu7/image/upload/v1750758324/QR_oe9arx.jpg",
}) => {
  const [showQR, setShowQR] = useState(false);

  const toggleQR = () => {
    setShowQR(!showQR);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleQR}
        className="fixed top-1/4 right-6 cursor-pointer transform -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white/20 backdrop-blur-sm z-40 group"
        aria-label="Buy Me a Coffee"
      >
        <Coffee
          size={26}
          className="group-hover:rotate-12 transition-transform duration-300"
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      </button>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 relative shadow-2xl border border-white/40 bg-white/80 transform transition-all duration-300 scale-100">
            {/* Close Button */}
            <button
              onClick={toggleQR}
              className="absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-slate-600 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-full p-2 transition-all duration-200 border border-white/40 shadow-lg"
              aria-label="Close QR Code"
            >
              <X size={18} />
            </button>

            {/* Header with Coffee Animation */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full sm:rounded-2xl mb-4 shadow-xl border-2 border-white/20 backdrop-blur-sm">
                <Coffee className="text-white animate-bounce" size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                Buy Me a Coffee
              </h3>
              <p className="text-slate-600 text-sm">
                Support my work with a coffee ☕
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm p-6 rounded-xl sm:rounded-2xl border border-white/40 shadow-inner">
              <img
                src={qrImageSrc}
                alt="Buy Me a Coffee QR Code"
                className="w-full max-w-xs mx-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center">
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-200/40 rounded-lg sm:rounded-xl p-4 bg-white/60">
                <p className="text-amber-800 text-sm font-medium mb-2">
                  📱 How to pay:
                </p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Open any Payment App → Tap "Scan QR code" → Point camera at QR
                  code above → Enter any amount → Complete payment
                </p>
              </div>
            </div>

            {/* Thank you message */}
            <div className="mt-4 text-center">
              <p className="text-slate-600 text-xs">
                Every coffee helps fuel more awesome projects! 🚀
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingBuyMeCoffeeButton;
