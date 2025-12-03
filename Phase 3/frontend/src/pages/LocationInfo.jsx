import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TagSelector from '../components/TagSelector';


const LocationSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const university = searchParams.get("university");
  const state = searchParams.get("state");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    types: {
      Room: false,
      Building: false,
      NonBuilding: false
    },
    roomSizes: {
      small: false,
      medium: false,
      large: false
    },
    roomTypes: {
      "study room": false,
      "computer room": false,
      "science lab": false,
      "classroom": false,
      "facility": false,
      "meeting room": false,
      "store": false,
      "venue": false
    },
    roomNumber: "",
      ratingFilters: {
        scoreMin: 1,
        scoreMax: 10,
        noiseMax: 5,
        cleanlinessMax: 5,
        equipment_qualityMax: 3,
        wifi_strengthMax: 3
      },
      searchByRating: false  // enables/disables rating filters
  });

  useEffect(() => {
    const params = new URLSearchParams();

  
    if (query) params.append("q", query);
    if (university) params.append("university", university);
    if (state) params.append("state", state);
  
    // Location types
    const selectedTypes = Object.keys(filters.types).filter(t => filters.types[t]);
    if (selectedTypes.length) {
      params.append("types", selectedTypes.join(",").toLowerCase());
    }
  
    // Room sizes (only when Room is enabled)
    if (filters.types.Room) {
      const selectedSizes = Object.keys(filters.roomSizes).filter(s => filters.roomSizes[s]);
      if (selectedSizes.length) {
        params.append("roomSizes", selectedSizes.join(","));
      }
    }
  
    // Room types
    if (filters.types.Room) {
      const selectedRoomTypes = Object.keys(filters.roomTypes).filter(rt => filters.roomTypes[rt]);
      if (selectedRoomTypes.length) {
        params.append("roomTypes", selectedRoomTypes.join(","));
      }
    }
  
    // Room number
    if (filters.types.Room && filters.roomNumber.trim() !== "") {
      params.append("roomNumber", filters.roomNumber.trim());
    }

    if (filters.searchByRating) {
      const rf = filters.ratingFilters;
      params.append("scoreMin", rf.scoreMin);
      params.append("scoreMax", rf.scoreMax);
      params.append("noiseMax", rf.noiseMax);
      params.append("cleanlinessMax", rf.cleanlinessMax);
      params.append("equipment_qualityMax", rf.equipment_qualityMax);
      params.append("wifi_strengthMax", rf.wifi_strengthMax);
    }
  
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
  
    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query, university, state, filters]);

  const handleRowClick = (loc) => {
    // Navigate to ratings page for this location
    // Pass location_name and university as query params
    navigate(`/ratings?location=${encodeURIComponent(loc.location_name)}&university=${encodeURIComponent(university)}`);
  };

  return (
    <div className="p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search for a location..."
    className="border p-2 rounded flex-1 text-white"
  />

  <button
    onClick={() => setShowFilters((prev) => !prev)}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    Filter
  </button>
</div>

{showFilters && (
  <div className="bg-gray-100 p-4 rounded mb-4 text-black">
    <div className="mb-2">
      <p className="font-semibold mb-1">Location Type:</p>
      {Object.keys(filters.types).map((type) => (
        <label key={type} className="mr-4">
          <input
            type="checkbox"
            checked={filters.types[type]}
            onChange={() =>
              setFilters((prev) => ({
                ...prev,
                types: { ...prev.types, [type]: !prev.types[type] }
              }))
            }
          />
          <span className="ml-1">{type}</span>
        </label>
      ))}
    </div>
    <button
  onClick={() =>
    setFilters(prev => ({
      ...prev,
      searchByRating: !prev.searchByRating
    }))
  }
  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
>
  {filters.searchByRating ? "Hide Rating Filters" : "Search by Rating"}
</button>
{filters.searchByRating && (
  <div className="p-4 border-t border-gray-400 space-y-4">
    <h3 className="font-semibold text-gray-700">Rating Filters</h3>

    {filters.searchByRating && (
  <>
    <h3 className="mt-4 font-semibold">Equipment Tags</h3>
    <TagSelector
      selectedTags={filters.selectedEquipmentTags || []}
      setSelectedTags={(tags) => setFilters({ ...filters, selectedEquipmentTags: tags })}
      placeholder="Search equipment tags..."
      fetchUrl="/api/equipmentTags"
    />

    <h3 className="mt-4 font-semibold">Accessibility Tags</h3>
    <TagSelector
      selectedTags={filters.selectedAccessibilityTags || []}
      setSelectedTags={(tags) => setFilters({ ...filters, selectedAccessibilityTags: tags })}
      placeholder="Search accessibility tags..."
      fetchUrl="/api/accessibilityTags"
    />
  </>
)}


    {/* Score slider */}
    <div>
      <label>Score (1-10):</label>
      <input
        type="number"
        min="1"
        max="10"
        value={filters.ratingFilters.scoreMin}
        onChange={(e) =>
          setFilters(prev => ({
            ...prev,
            ratingFilters: { ...prev.ratingFilters, scoreMin: +e.target.value }
          }))
        }
        className="ml-2 w-16 rounded-2xl text-center bg-gray-300"
      />
      -
      <input
        type="number"
        min="1"
        max="10"
        value={filters.ratingFilters.scoreMax}
        onChange={(e) =>
          setFilters(prev => ({
            ...prev,
            ratingFilters: { ...prev.ratingFilters, scoreMax: +e.target.value }
          }))
        }
        className="ml-2 w-16 rounded-2xl text-center bg-gray-300"
      />
    </div>

    {/* Noise slider */}
    <div>
      <label className="block text-gray-700">Noise (max): {filters.ratingFilters.noiseMax}</label>
      <input
        type="range"
        min="1"
        max="5"
        value={filters.ratingFilters.noiseMax}
        onChange={(e) =>
          setFilters(prev => ({
            ...prev,
            ratingFilters: { ...prev.ratingFilters, noiseMax: +e.target.value }
          }))
        }
        className="w-64"
      />
    </div>

    {/* Cleanliness slider */}
    <div>
      <label className="block text-gray-700">Cleanliness (max): {filters.ratingFilters.cleanlinessMax}</label>
      <input
        type="range"
        min="1"
        max="5"
        value={filters.ratingFilters.cleanlinessMax}
        onChange={(e) =>
          setFilters(prev => ({
            ...prev,
            ratingFilters: { ...prev.ratingFilters, cleanlinessMax: +e.target.value }
          }))
        }
        className="w-64"
      />
    </div>

    {/* Equipment Quality slider */}
    <div>
      <label className="block text-gray-700">Equipment Quality (max): {filters.ratingFilters.equipment_qualityMax}</label>
      <input
        type="range"
        min="1"
        max="3"
        value={filters.ratingFilters.equipment_qualityMax}
        onChange={(e) =>
          setFilters(prev => ({
            ...prev,
            ratingFilters: { ...prev.ratingFilters, equipment_qualityMax: +e.target.value }
          }))
        }
        className="w-64"
      />
    </div>

    {/* WiFi Strength slider */}
    <div>
      <label className="block text-gray-700">WiFi Strength (max): {filters.ratingFilters.wifi_strengthMax}</label>
      <input
        type="range"
        min="1"
        max="3"
        value={filters.ratingFilters.wifi_strengthMax}
        onChange={(e) =>
          setFilters(prev => ({
            ...prev,
            ratingFilters: { ...prev.ratingFilters, wifi_strengthMax: +e.target.value }
          }))
        }
        className="w-64"
      />
    </div>
  </div>
)}


    {filters.types.Room && (
      <div>
        <p className="font-semibold mb-1">Room Size:</p>
        {Object.keys(filters.roomSizes).map((size) => (
          <label key={size} className="mr-4">
            <input
              type="checkbox"
              checked={filters.roomSizes[size]}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  roomSizes: { ...prev.roomSizes, [size]: !prev.roomSizes[size] }
                }))
              }
            />
            <span className="ml-1">{size}</span>
          </label>
        ))}
        <p className="font-semibold mt-4 mb-1">Room Type:</p>
        {Object.keys(filters.roomTypes).map((roomType) => (
          <label key={roomType} className="mr-4">
            <input
              type="checkbox"
              checked={filters.roomTypes[roomType]}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  roomTypes: { ...prev.roomTypes, [roomType]: !prev.roomTypes[roomType] }
                }))
              }
              />
            <span className="ml-1">{roomType}</span>
            </label>  
        ))}
      </div>
    )}
  </div>
)}


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
