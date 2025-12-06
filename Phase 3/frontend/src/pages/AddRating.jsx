import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const AddReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const locationName = searchParams.get("location");
  const university = searchParams.get("university");

  const [form, setForm] = useState({
    username: "test user",
    score: 5,
    noise: 3,
    cleanliness: 3,
    equipment_quality: 2,
    wifi_strength: 2,
    comment: "testing comment",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/addReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          location: locationName,
          university,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      navigate(`/reviews?location=${encodeURIComponent(locationName)}&university=${encodeURIComponent(university)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-8 flex justify-center">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-white text-lg bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 z-50"
      >
        <ArrowLeft className="inline w-5 h-5 mr-1" />
        Back
      </button>

      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 flex items-center justify-center z-50"
      >
        <Home className="w-6 h-6" />
      </button>

      <div className="max-w-xl w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl text-white">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Add Review for <br />
          <span className="text-slate-300">{locationName}</span>
        </h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg text-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label>
              Score (1-10)
              <input type="number" name="score" min="1" max="10" value={form.score} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-black" />
            </label>
            <label>
              Noise (1-5)
              <input type="number" name="noise" min="1" max="5" value={form.noise} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-black" />
            </label>
            <label>
              Cleanliness (1-5)
              <input type="number" name="cleanliness" min="1" max="5" value={form.cleanliness} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-black" />
            </label>
            <label>
              Equipment Quality (1-3)
              <input type="number" name="equipment_quality" min="1" max="3" value={form.equipment_quality} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-black" />
            </label>
            <label>
              Wi-Fi Strength (1-3)
              <input type="number" name="wifi_strength" min="1" max="3" value={form.wifi_strength} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-black" />
            </label>
          </div>

          <div>
            <label>Comment</label>
            <textarea name="comment" value={form.comment} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-black" rows="4"></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-xl text-white font-medium">
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReview;