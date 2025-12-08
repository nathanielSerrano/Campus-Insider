import { use, useState } from "react";
import { Eye, EyeOff, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

const Register = () => {
  const [email, setEmail] = useState(""); //used as username
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // University search state
  const [universityQuery, setUniversityQuery] = useState("");
  const [universityResults, setUniversityResults] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  // Role
  const [role, setRole] = useState("student");

  const navigate = useNavigate();

  // Search universities as user types
  const handleUniversitySearch = async (q) => {
    setUniversityQuery(q);
    setSelectedUniversity(null); // clear selection when typing
    
    if (!q.trim()) {
      setUniversityResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUniversityResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleUniversitySelect =  (uni) => {
    setSelectedUniversity(uni);
    setUniversityQuery(uni.university);
    setSelectedUniversity([]);
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault
    if (!selectedUniversity) return alert("Please select a valid university.");
    if (password !== confirmPassword) return alert("Passwords do not match.");
    if (!email || !password) return alert("Email and password cannot be empty.");
    if (email.toLowerCase().includes("admin")) return alert("Username cannot contain 'admin'.");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
          role,
          university: selectedUniversity.university,
          state: selectedUniversity.state,
        }),
      });
      
      const data = await response.json();

      if (!response.ok) return alert(data.error || "Registration failed");

      navigate("/login");
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Network error, please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center px-6 relative">

      {/* Back & Home buttons */}
      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-white text-lg bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105">← Back</button>
      <button onClick={() => navigate("/")} className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 flex items-center justify-center"><Home className="w-6 h-6" /></button>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-10 shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Create an Account</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-white/80 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* University */}
          <div className="relative">
            <label className="block text-white/80 mb-1">University (Search & Select)</label>
            <input type="text" value={selectedUniversity ? selectedUniversity.university : universityQuery}
              onChange={(e) => handleUniversitySearch(e.target.value)}
              placeholder="Start typing to search..." required
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" />

            {universityResults.length > 0 && !selectedUniversity && (
              <div className="absolute z-20 mt-2 w-full bg-slate-800/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {universityResults.map((u, idx) => (
                  <button key={idx} type="button" onClick={() => handleUniversitySelect(u)}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition">
                    {u.university} <span className="text-white/50">({u.state})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-white/80 mb-1">Your Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/80 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-white/80 mb-1">Confirm Password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="********" required
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition">{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit"
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all hover:scale-[1.03] shadow-lg shadow-blue-900/40">
            Create Account
          </button>
        </form>

        <p className="text-center text-white/60 text-sm mt-4">
          Already have an account? <Link to="/login" className="text-blue-300 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;