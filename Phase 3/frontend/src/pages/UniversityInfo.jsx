import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";


const UniversityInfo = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const location = useLocation();

  // Extract state from query string (ex: ?state=California)
  const searchParams = new URLSearchParams(location.search);
  const state = searchParams.get("state");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!name || !state) return;

    const encodedName = encodeURIComponent(name);
    const encodedState = encodeURIComponent(state);

    fetch(`/api/university?name=${encodedName}&state=${encodedState}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch university data");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching university info:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [name, state]);

  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  const uni = data.university_info?.[0]; // First row
  const campuses = data.campuses || [];
  const locations = data.locations || [];

  const handleLocationSearch = () => {
    // Navigate to /locations with university info
    // Optionally pass state in query string
    navigate(`/location?university=${encodeURIComponent(uni.name)}&state=${encodeURIComponent(uni.state)}`);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">
        {uni?.name} ({uni?.state})
      </h1>

      {uni?.wiki_url && (
        <p className="mb-4">
          <a
            href={uni.wiki_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Wikipedia Link
          </a>
        </p>
      )}

      <button
        onClick={handleLocationSearch}
        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded mb-4"
      >
        Search Locations
      </button>

      <h2 className="text-xl font-semibold mt-6 mb-2">Campuses</h2>
      <ul className="list-disc ml-6">
        {campuses.map((c, i) => (
          <li key={i}>{c.campus_name}</li>
        ))}
      </ul>



      <h2 className="text-xl font-semibold mt-6 mb-2">Locations & Ratings</h2>
      <div className="bg-gray-800 p-4 rounded-lg">
        {locations.map((loc, i) => (
          <div key={i} className="border-b border-gray-700 py-2">
            <p className="font-semibold">
              {loc.location_name} ({loc.location_type})
            </p>
            {loc.room_number && (
              <p className="text-gray-300">Room: {loc.room_number}</p>
            )}
            {loc.score !== null && (
              <p className="text-gray-400">
                ⭐ Score: {loc.score} — by {loc.rated_by}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UniversityInfo;
