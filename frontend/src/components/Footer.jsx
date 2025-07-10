import { ExternalLink, Zap } from "lucide-react";
import React from "react";

function Footer() {
  return (
    <div className="relative mt-12 sm:mt-16 lg:mt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 px-2">
            Ready to showcase your work?
          </h3>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-2">
            Your portfolio is the key to unlocking new opportunities. Make it
            count.
          </p>
        </div>

        <div className="text-center mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10">
          <p className="text-blue-200 text-xs sm:text-sm px-2">
            © 2025 BuildFolio. Empowering professionals to showcase their best
            work.
          </p>
          <p className="text-blue-200 text-xs sm:text-sm mt-2 px-2">
            Developed by
            <a
              href="https://www.linkedin.com/in/chiranjeevsehgal/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold inline-flex items-center gap-1 ml-1 hover:text-white transition-colors"
            >
              Chiranjeev Sehgal
              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
