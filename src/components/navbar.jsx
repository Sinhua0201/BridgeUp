import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";  // ✅ 改用 onValue 即時監聽
import { auth, db } from "../firebase";
import LoginModal from "../pages/LoginModal";
import { Menu, X, User, ChevronDown, Bell, Search } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // ✅ 監聽 Firebase Auth 狀態
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // ✅ 監聽 Realtime Database 裡這個使用者的節點
        const userRef = ref(db, "users/" + currentUser.uid);
        const unsubscribeDB = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setFullName(snapshot.val().fullName);
          } else {
            setFullName(""); // 沒有資料就清空
          }
        });

        // ✅ 清理 DB 監聽（避免 memory leak）
        return () => unsubscribeDB();
      } else {
        setUser(null);
        setFullName("");
      }
    });

    // ✅ 清理 Auth 監聽
    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setFullName("");
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-xl fixed w-full top-0 left-0 z-50 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ✅ Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BridgeUp
              </span>
            </Link>
          </div>

          {/* ✅ Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium">
              Home
            </Link>
            <Link to="/career" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium">
              Career Navigator
            </Link>
            <Link to="/internships" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium">
              Micro-Internships
            </Link>
            <Link to="/mentors" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium">
              Mentors
            </Link>
            <Link to="/challenges" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium">
              Challenges
            </Link>
          </div>

          {/* ✅ Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              <Search size={20} />
            </button>

            {/* Notifications */}
            {user && (
              <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 relative">
                <Bell size={20} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </button>
            )}

            {user ? (
              <div className="relative">
                {/* User Menu Button */}
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-white font-medium">
                    {fullName || "Loading..."} {/* ✅ 這裡如果 DB 還沒讀到會顯示 Loading */}
                  </span>
                  <ChevronDown size={16} className={`text-gray-300 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm text-gray-600">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{fullName || "Loading..."}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      Your Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      Settings
                    </Link>
                    <div className="border-t border-gray-200 mt-1 pt-1">
                      <button 
                        onClick={handleLogout} 
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                Get Started
              </button>
            )}
          </div>

          {/* ✅ Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-purple-500/20">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link 
              to="/" 
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link 
              to="/career" 
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              onClick={() => setIsOpen(false)}>
              Career Navigator
            </Link>
            <Link 
              to="/internships" 
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              onClick={() => setIsOpen(false)}>
              Micro-Internships
            </Link>
            <Link 
              to="/mentors" 
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              onClick={() => setIsOpen(false)}>
              Mentors
            </Link>
            <Link 
              to="/challenges" 
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              onClick={() => setIsOpen(false)}>
              Challenges
            </Link>
            
            {/* Mobile User Section */}
            <div className="pt-4 border-t border-white/20">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="text-white font-medium">
                      {fullName || "Loading..."}
                    </span>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    onClick={() => setIsOpen(false)}>
                    Your Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    onClick={() => setIsOpen(false)}>
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }} 
                    className="block w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200">
                    Sign out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsOpen(false);
                  }} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg">
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </nav>
  );
}
