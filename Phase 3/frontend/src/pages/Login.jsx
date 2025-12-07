import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AccountButton from "../components/AccountButton";


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // will be used as username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,  // use email as username
          password,
        }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      // Save username and role in localStorage for later pages
        // after successful registration/login:
      login({
        email: email,
        university: data["university_id"],
        role: data["role"],
      });


      // Redirect to home or desired page
      navigate("/search");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error, please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center px-6 relative">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-white text-lg bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105"
      >
        ← Back
      </button>

      {/* Home button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 flex items-center justify-center"
      >
        <Home className="w-6 h-6" />
      </button>

      <AccountButton />   {/* The new button */}


      {/* Glass Card */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl w-full max-w-md text-white">
        <h1 className="text-4xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email / Username */}
          <div>
            <label className="block text-white/80 mb-1">Email / Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/80 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="********"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 text-lg font-medium bg-blue-500 hover:bg-blue-600 rounded-xl transition-all shadow-lg shadow-blue-900/30 hover:scale-[1.03]"
          >
            Login
          </button>

          {/* Error Message */}
          {error && <p className="text-red-400 mt-2 text-center">{error}</p>}

        </form>

        <p className="text-center text-white/70 text-sm mt-5">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-300 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;