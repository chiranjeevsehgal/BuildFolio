import { Zap } from 'lucide-react'
import React from 'react'

function Footer() {
  return (
    <div className="relative mt-20">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900"></div>
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to showcase your work?
              </h3>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Your portfolio is the key to unlocking new opportunities. Make it count.
              </p>
            </div>

            
            
              <div className="text-center mt-8 pt-8 border-t border-white/10">
                <p className="text-blue-200 text-sm">
                  © 2025 BuildFolio. Empowering professionals to showcase their best work.
                </p>
              </div>
            </div>
          
        </div>
  )
}

export default Footer