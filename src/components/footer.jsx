export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-purple-900/80 via-slate-900 to-black text-gray-300 py-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Logo 或 标题（可选） */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="BridgeUp Logo" className="w-12 h-12 mr-3" />
          <h2 className="text-xl font-bold text-white">BridgeUp</h2>
        </div>

        {/* Links */}
        <div className="flex justify-center space-x-8 mb-4">
          <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">About</a>
          <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">Contact</a>
          <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">Privacy Policy</a>
          <a href="/mentorrequestspage" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">Terms of Service</a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} <span className="text-white font-semibold">BridgeUp</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
