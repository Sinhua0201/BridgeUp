import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // ✅ 引入 useNavigate

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();  // ✅ 创建 navigate

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ✅ 点击后真正导航
  const handleFeatureClick = (feature) => {
    navigate(feature);
  };

  const features = [
    {
      path: "/career",
      title: "AI Career Navigator",
      icon: "🚀",
      description: "Discover your perfect career path with AI guidance",
      color: "from-blue-500 to-purple-600",
      hoverColor: "from-blue-600 to-purple-700"
    },
    {
      path: "/internships",
      title: "Micro-Internship Hub",
      icon: "🎯",
      description: "Gain real experience through bite-sized projects",
      color: "from-green-500 to-teal-600",
      hoverColor: "from-green-600 to-teal-700"
    },
    {
      path: "/mentors",
      title: "Mentor Connect",
      icon: "💬",
      description: "Connect with industry professionals",
      color: "from-purple-500 to-pink-600",
      hoverColor: "from-purple-600 to-pink-700"
    },
    {
      path: "/challenges",
      title: "Industry Challenges",
      icon: "🏆",
      description: "Solve real-world problems and showcase skills",
      color: "from-pink-500 to-red-600",
      hoverColor: "from-pink-600 to-red-700"
    },
    {
      path: "/career-coach",
      title: "AI Career Coach",
      icon: "📝",
      description: "Personalized career coaching powered by AI",
      color: "from-orange-500 to-yellow-600",
      hoverColor: "from-orange-600 to-yellow-700"
    },
    {
      path: "/gamified-journey",
      title: "Gamified Journey",
      icon: "🎮",
      description: "Level up your career like a game",
      color: "from-teal-500 to-cyan-600",
      hoverColor: "from-teal-600 to-cyan-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Dynamic Mouse Following Gradient */}
      <div 
        className="absolute pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-4">
        
        {/* Logo with Glow Effect */}
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
              <img src="/logo.png" alt="BridgeUp Logo" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Title with Gradient Text */}
        <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome to BridgeUp
          </h1>
        </div>

        {/* Subtitle */}
        <div className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <p className="text-gray-300 text-xl md:text-2xl max-w-4xl mb-4 leading-relaxed font-light">
            Your <span className="text-cyan-400 font-semibold">AI-powered career companion</span> for the future
          </p>
          <p className="text-gray-400 text-lg max-w-3xl mb-12 leading-relaxed">
            Empowering Malaysian students with real-world experience, industry guidance, and career confidence
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mb-12">
            {features.map((feature, index) => (
              <div 
                key={index} 
                onClick={() => handleFeatureClick(feature.path)}
                className="group cursor-pointer"
              >
                <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${feature.color} transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 border border-white/10 backdrop-blur-sm`}>
                  
                  {/* Card Glow Effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`}></div>
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-200 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Career Insights Dashboard - Special Featured Card */}
        <div className={`transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div 
            onClick={() => handleFeatureClick('/dashboard')}
            className="group block w-full max-w-2xl cursor-pointer"
          >
            <div className="relative p-8 rounded-3xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 border border-white/20 backdrop-blur-sm mb-12">
              
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              
              <div className="relative z-10 text-center">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  📊
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-200 transition-colors duration-300">
                  Career Insights Dashboard
                </h3>
                <p className="text-white/90 text-lg leading-relaxed group-hover:text-white transition-colors duration-300">
                  Unlock powerful analytics and insights about your career journey
                </p>
              </div>

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100"></div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <button 
              onClick={() => alert('Welcome to BridgeUp! Sign up feature coming soon!')}
              className="relative px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg font-semibold rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-cyan-500/25 border border-white/20"
            >
              🌟 Start Your Journey Now
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mt-6 animate-bounce">
            Join thousands of students already building their future
          </p>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Statistics Section */}
        <div className={`transform transition-all duration-1000 delay-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mt-16`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">10K+</div>
              <div className="text-gray-400">Students Empowered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-gray-400">Industry Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">95%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
