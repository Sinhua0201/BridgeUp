import { useState } from "react";
import { auth, db } from "../firebase";  
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";  // ✅ Realtime Database API

export default function LoginModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");   
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [company, setCompany] = useState("");      // ✅ 公司
  const [position, setPosition] = useState("");    // ✅ 职称
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("✅ Login successful!");
        setTimeout(() => {
          setLoading(false);
          onClose();
        }, 1000);
      } else {
        if (password !== confirmPassword) {
          setError("❌ Passwords do not match");
          setLoading(false);
          return;
        }

        if (role === "mentor" && (!company.trim() || !position.trim())) {
          setError("❌ Please fill in your company and position.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        const userData = {
          fullName: fullName,
          email: email,
          role: role,
          createdAt: new Date().toISOString()
        };

        if (role === "mentor") {
          userData.company = company;
          userData.position = position;
        }

        await set(ref(db, "users/" + userId), userData);

        setSuccess("✅ Account created successfully!");
        setTimeout(() => {
          setLoading(false);
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-black bg-opacity-50 z-[999]">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        
        {/* ✅ Modal Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold text-blue-600">
            {isLogin ? "Login to BridgeUp" : "Register for BridgeUp"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✖</button>
        </div>

        {/* ✅ Form */}
        <div className="mt-4">
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* ✅ Full Name */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="John Doe"
                  required 
                />
              </div>
            )}

            {/* ✅ Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="example@mail.com" 
                required
              />
            </div>

            {/* ✅ Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2" 
                placeholder="••••••••" 
                required
              />
            </div>

            {/* ✅ Confirm Password */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            )}

            {/* ✅ Role */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Role</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="role" 
                      value="student" 
                      checked={role === "student"} 
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <span>Student</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="role" 
                      value="mentor" 
                      checked={role === "mentor"} 
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <span>Mentor</span>
                  </label>
                </div>
              </div>
            )}

            {/* ✅ Company & Position for Mentor */}
            {!isLogin && role === "mentor" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input 
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g. Google"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input 
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>
              </>
            )}

            {/* ✅ Error & Success */}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            {/* ✅ Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
            </button>
          </form>

          {/* ✅ Switch Login/Register */}
          <p className="text-sm text-gray-600 mt-4 text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-blue-600 ml-1 hover:underline">
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
