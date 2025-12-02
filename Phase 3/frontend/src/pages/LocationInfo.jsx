import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LocationSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const university = searchParams.get("university");
  const state = searchParams.get("state");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!university) return;

    const params = new URLSearchParams({
      university,
      state: state || "",
      q: query
    });

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/locationSearch?${params.toString()}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, 300); // debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [query, university, state]);

  const handleRowClick = (loc) => {
    // Navigate to ratings page for this location
    // Pass location_name and university as query params
    navigate(`/ratings?location=${encodeURIComponent(loc.location_name)}&university=${encodeURIComponent(university)}`);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">
        Search Locations at {university} ({state})
      </h1>

      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search for a location..."
        className="border p-2 rounded w-full mb-4 text-white"
      />

      {loading && <p>Loading...</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead className="bg-gray-700 text-left">
            <tr>
              <th className="p-3">Location Name</th>
              <th className="p-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {results.map((loc, idx) => (
              <tr
                key={idx}
                className="cursor-pointer hover:bg-gray-600 transition"
                onClick={() => handleRowClick(loc)}
              >
                <td className="p-3">{loc.location_name}</td>
                <td className="p-3">{loc.location_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LocationSearch;
