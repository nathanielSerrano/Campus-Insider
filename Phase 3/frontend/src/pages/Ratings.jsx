import { useState, useEffect, use } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AccountButton from "../components/AccountButton";

const Ratings = () => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);


  const locationName = searchParams.get("location");
  const universityName = searchParams.get("university");

  const [ratings, setRatings] = useState([]);
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false); // <-- NEW

  const safeEmail = user?.email || "";   // ← fallback for non-logged in users


  const [newReview, setNewReview] = useState({
    username: safeEmail,
    score: 5,
    noise: 3,
    cleanliness: 3,
    equipment_quality: 2,
    wifi_strength: 2,
    comment: "testing comment",
  });

  // Fetch ratings
  useEffect(() => {
    if (!locationName || !universityName) return;

    setLoading(true);
    fetch(
      `/api/locationRatings?location=${encodeURIComponent(
        locationName
      )}&university=${encodeURIComponent(universityName)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setLocationInfo(data.location);
        setRatings(data.ratings || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [locationName, universityName]);

  // Submit new review
  const handleSubmitReview = (e) => {
    e.preventDefault();

    const username = safeEmail;
    if (!username) {
      navigate("/register");
      return;
    }

    const payload = {
      ...newReview,
      location: locationName,
      university: universityName,
      username,
    };

    fetch("/api/addReview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);

        // Server MUST return user role in `data.role`
        const newEntry = {
          ...payload,
          role: user.role, // <-- NEW
        };

        setRatings([newEntry, ...ratings]);
        setMessage({ type: "success", text: "Review submitted!" });
        setNewReview({ ...newReview, comment: "" });
      })
      .catch((err) => {
        setMessage({ type: "error", text: err.message });
      });
  };

  // Compute average score
  const totalScore =
    ratings.length === 0
      ? 0
      : Math.round(
          (ratings.reduce((sum, r) => sum + Number(r.score), 0) /
            ratings.length) *
            100
        ) / 100;

  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (!locationInfo)
    return <div className="text-red-500 p-4">Location not found.</div>;
  console.log(locationInfo);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-8 flex justify-center">

      {/* Back & Home Buttons */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-white text-lg bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 z-50"
      >
        <ArrowLeft className="inline w-4 h-4 mr-1" /> Back
      </button>
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 flex items-center justify-center z-50"
      >
        <Home className="w-6 h-6" />
      </button>
      <AccountButton />

      <div className="max-w-5xl w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl text-white">
        
        {/* Header */}
        <h1 className="text-4xl font-bold mb-2">{locationName}</h1>
        <p className="text-xl mb-4 text-slate-300">
          {universityName} | Type:{" "} {locationInfo.location_type} | Campus: {" "}
          {locationInfo.campus_name} | Building:{" "}
          {locationInfo.building_name || "-"}
        </p>

        {/* Total Score */}
        <div className="text-center mb-8">
          <span className="text-6xl font-extrabold text-yellow-400">
            {totalScore}
          </span>
          <p className="text-white/70 text-lg">Average Score</p>
        </div>

        {/* Ratings List */}
        <div className="space-y-4 mb-8">
          {ratings.length === 0 && (
            <p className="text-slate-300">No ratings yet.</p>
          )}

          {ratings.map((r, i) => (
            <div
              key={i}
              className="p-4 bg-white/10 rounded-xl border border-white/20 flex flex-col md:flex-row justify-between items-center"
            >
              <div className="flex-1">
                <p className="font-semibold text-yellow-200">
                  {r.role || "User"} {/* <-- NOW SHOWS ROLE */}
                </p>
                {r.comment && <p className="italic">{r.comment}</p>}
              </div>

              <div className="flex space-x-6 mt-2 md:mt-0">
                <div className="text-center">
                  <span className="text-3xl font-bold text-yellow-300">
                    {r.score}
                  </span>
                  <p className="text-sm text-white/70">Score</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-green-300">
                    {r.noise}
                  </span>
                  <p className="text-sm text-white/70">Noise</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-blue-300">
                    {r.cleanliness}
                  </span>
                  <p className="text-sm text-white/70">Clean</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-purple-300">
                    {r.equipment_quality}
                  </span>
                  <p className="text-sm text-white/70">Equip</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-pink-300">
                    {r.wifi_strength}
                  </span>
                  <p className="text-sm text-white/70">WiFi</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* === Add Review Section Toggle Button === */}
        <button
          onClick={() => {
            const user = localStorage.getItem("username");
            if (!user) return navigate("/register");
            setShowForm(!showForm);
          }}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl mb-4"
        >
          {showForm ? "Hide Review Form" : "Add Rating"}
        </button>

        {/* Review Form */}
        {showForm && (
          <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <h2 className="text-2xl font-semibold mb-4">Add a Review</h2>
            <form
              onSubmit={handleSubmitReview}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label>Score (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newReview.score}
                  onChange={(e) =>
                    setNewReview({ ...newReview, score: Number(e.target.value) })
                  }
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              <div>
                <label>Noise (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newReview.noise}
                  onChange={(e) =>
                    setNewReview({ ...newReview, noise: Number(e.target.value) })
                  }
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              <div>
                <label>Cleanliness (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newReview.cleanliness}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      cleanliness: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              <div>
                <label>Equipment (1-3)</label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={newReview.equipment_quality}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      equipment_quality: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              <div>
                <label>WiFi (1-3)</label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={newReview.wifi_strength}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      wifi_strength: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label>Comment</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={3}
                  placeholder="Optional comment..."
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl"
                >
                  Submit Review
                </button>
              </div>
            </form>

            {message && (
              <p
                className={`mt-4 ${
                  message.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ratings;