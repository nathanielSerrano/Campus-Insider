import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TagSelector from "../components/TagSelector";
import { Home, Search, SlidersHorizontal } from "lucide-react";
import PaginatedTable from "../components/PaginatedTable";
import AccountButton from "../components/AccountButton";


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

  const [sortConfig, setSortConfig] = useState({
    key: "location_name",
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);



  const [filters, setFilters] = useState({
    types: { Room: false, Building: false, NonBuilding: false },
    roomSizes: { small: false, medium: false, large: false },
    roomTypes: {
      "study room": false,
      "computer room": false,
      "science lab": false,
      classroom: false,
      facility: false,
      "meeting room": false,
      store: false,
      venue: false,
    },
    roomNumber: "",
    ratingFilters: {
      scoreMin: 1,
      scoreMax: 10,
      noiseMax: 5,
      cleanlinessMax: 5,
      equipment_qualityMax: 3,
      wifi_strengthMax: 3,
    },
    searchByRating: false,
    buildingName: "",
    campusName: "",
    selectedEquipmentTags: [],
    selectedAccessibilityTags: [],
  });

  useEffect(() => {
    const params = new URLSearchParams();

    if (query) params.append("q", query);
    if (university) params.append("university", university);
    if (state) params.append("state", state);

    // Types
    const selectedTypes = Object.keys(filters.types).filter((t) => filters.types[t]);
    if (selectedTypes.length) params.append("types", selectedTypes.join(",").toLowerCase());

    // Room sizes (Room only)
    if (filters.types.Room) {
      const selectedSizes = Object.keys(filters.roomSizes).filter((s) => filters.roomSizes[s]);
      if (selectedSizes.length) params.append("roomSizes", selectedSizes.join(","));
    }

    // Room types
    if (filters.types.Room) {
      const selectedRoomTypes = Object.keys(filters.roomTypes).filter((rt) => filters.roomTypes[rt]);
      if (selectedRoomTypes.length) params.append("roomTypes", selectedRoomTypes.join(","));
    }

    if (filters.types.Room && filters.roomNumber.trim() !== "") {
      params.append("roomNumber", filters.roomNumber.trim());
    }


    if (filters.campusName.trim() !== "") {
      params.append("campus", filters.campusName.trim());
    }

    if (filters.buildingName.trim() !== "") {
      params.append("building", filters.buildingName.trim());
    }

    if (filters.searchByRating) {
      const rf = filters.ratingFilters;
      for (const key in rf) params.append(key, rf[key]);
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/locationSearch?${params.toString()}`);
        const json = await res.json();
        setResults(json.results || []);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeout);
  }, [query, university, state, filters]);

  useEffect(() => {
    setCurrentPage(1); // reset page whenever filters change
  }, [filters, query]);

  const isEmpty = results.length === 0 && query.length > 0;

  const handleRowClick = (loc) => {
    navigate(
      `/ratings?location=${encodeURIComponent(loc.location_name)}&university=${encodeURIComponent(
        university
      )}`
    );
  };

  const columns = [
    { label: "Location Name", key: "location_name" },
    { label: "Type", key: "location_type" },
    { label: "Campus", key: "campus_name" },
    { label: "Building", key: "building_name" },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-8 flex justify-center">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="
          absolute top-6 left-6
          text-white text-lg
          bg-white/10 hover:bg-white/20
          px-4 py-2 rounded-xl
          backdrop-blur-md border border-white/20
          transition-all hover:scale-105
          z-50
        "
      >
        ← Back
      </button>

      <button
        onClick={() => navigate("/")}
        className="
          absolute top-6 right-6
          text-white
          bg-white/10 hover:bg-white/20
          p-3 rounded-xl
          backdrop-blur-md border border-white/20
          transition-all hover:scale-105
          flex items-center justify-center
          z-50
        "
      >
        <Home className="w-6 h-6" />
      </button>
      <AccountButton />
      <div className="max-w-5xl w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl text-white">


        {/* Header */}
        <h1 className="text-4xl font-bold mb-6 text-center">
          Search for Locations at <br></br><span className="text-slate-300">{university}</span>
        </h1>

        {/* Search Bar + Filter Toggle */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 z-10"
              size={20}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a university location..."
              className="
                w-full pl-12 pr-4 py-3 rounded-xl
                bg-white/10 text-white placeholder-white/50
                border border-white/20
                backdrop-blur-md
                focus:outline-none focus:ring-2 focus:ring-blue-400
              "
              autoFocus
            />
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="
              px-4 py-3 rounded-xl
              bg-blue-500 hover:bg-blue-600
              text-white font-medium
              flex items-center gap-2
              transition
              shadow-md shadow-blue-900/40
            "
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl mb-8 text-white backdrop-blur-lg space-y-6">

            {/* Location Types */}
            <div>
              <h3 className="font-semibold mb-2 text-lg">Location Type</h3>
              <div className="flex flex-wrap gap-4">
                {Object.keys(filters.types).map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.types[type]}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          types: { ...prev.types, [type]: !prev.types[type] },
                        }))
                      }
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Room Filters */}
            {filters.types.Room && (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Room Size</h3>
                  <div className="flex gap-4">
                    {Object.keys(filters.roomSizes).map((size) => (
                      <label key={size} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.roomSizes[size]}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              roomSizes: { ...prev.roomSizes, [size]: !prev.roomSizes[size] },
                            }))
                          }
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Room Type</h3>
                  <div className="flex flex-wrap gap-4">
                    {Object.keys(filters.roomTypes).map((rt) => (
                      <label key={rt} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.roomTypes[rt]}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              roomTypes: { ...prev.roomTypes, [rt]: !prev.roomTypes[rt] },
                            }))
                          }
                        />
                        {rt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Building Name</h3>
                  <input
                    type="text"
                    value={filters.buildingName}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        buildingName: e.target.value,
                      }))
                    }
                    placeholder="Search by building..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  />
                </div>
              </>
            )}

            <div>
              <h3 className="font-semibold mb-2 text-lg">Campus</h3>
              <input
                type="text"
                value={filters.campusName}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    campusName: e.target.value,
                  }))
                }
                placeholder="Search by campus..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-white"
              />
            </div>

            {/* Rating Toggle */}
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, searchByRating: !prev.searchByRating }))
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              {filters.searchByRating ? "Hide Rating Filters" : "Search by Rating"}
            </button>

            {/* Rating Filters */}
            {filters.searchByRating && (
              <div className="border-t border-white/10 pt-4 space-y-6">
                <h3 className="font-semibold text-lg">Rating Filters</h3>

                {/* Score */}
                <div>
                  <label>Score Range:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={filters.ratingFilters.scoreMin}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          ratingFilters: {
                            ...prev.ratingFilters,
                            scoreMin: +e.target.value,
                          },
                        }))
                      }
                      className="px-2 w-16 rounded-xl bg-white/20"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={filters.ratingFilters.scoreMax}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          ratingFilters: {
                            ...prev.ratingFilters,
                            scoreMax: +e.target.value,
                          },
                        }))
                      }
                      className="px-2 w-16 rounded-xl bg-white/20"
                    />
                  </div>
                </div>

                {/* Sliders */}
                {["Min Noise level", "Min Cleanliness level", "Min Equipment Quality", "Min Wifi Strength"].map(
                  (field) => (
                    <div key={field}>
                      <label className="block capitalize">
                        {field.replace("_", " ")}: {filters.ratingFilters[field]}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max={field.includes("Quality") || field.includes("Wifi") ? "3" : "5"}
                        value={filters.ratingFilters[field]}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            ratingFilters: {
                              ...prev.ratingFilters,
                              [field]: +e.target.value,
                            },
                          }))
                        }
                        className="w-64"
                      />
                    </div>
                  )
                )}

                {/* Equipment + Accessibility Tags */}
                <div>
                  <h3 className="font-semibold mt-6">Equipment Tags</h3>
                  <TagSelector
                    selectedTags={filters.selectedEquipmentTags || []}
                    setSelectedTags={(tags) =>
                      setFilters({ ...filters, selectedEquipmentTags: tags })
                    }
                    placeholder="Search equipment tags..."
                    fetchUrl="/api/equipmentTags"
                  />

                  <h3 className="font-semibold mt-6">Accessibility Tags</h3>
                  <TagSelector
                    selectedTags={filters.selectedAccessibilityTags || []}
                    setSelectedTags={(tags) =>
                      setFilters({ ...filters, selectedAccessibilityTags: tags })
                    }
                    placeholder="Search accessibility tags..."
                    fetchUrl="/api/accessibilityTags"
                  />
                </div>
              </div>
            )}
          </div>

        )}


        {/* Results Table */}
        <div className="overflow-x-auto">

          <PaginatedTable
            data={results}
            columns={columns}
            rowsPerPage={10}
            onRowClick={(loc) => handleRowClick(loc)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />

          {loading && (
            <p className="text-center text-slate-300 mt-4">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSearch;
