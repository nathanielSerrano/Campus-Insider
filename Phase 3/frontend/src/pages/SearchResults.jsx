// Author: Nathaniel Serrano
// Description: Search results page for universities with filtering options.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Search, Home } from "lucide-react";
import AccountButton from "../components/AccountButton";


export default function SearchResults() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    state: "",
    campusType: "",
  });

  useEffect(() => {
    if (!query && !filters.state && !filters.campusType) {
      setResults([]);
      return;
    }

    setLoading(true);

    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (filters.state) params.append("state", filters.state);
    if (filters.campusType) params.append("campusType", filters.campusType);

    fetch(`/api/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setResults(data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, filters]);

  const handleRowClick = (row) => {
    navigate(
      `/university/${encodeURIComponent(row.university)}?state=${encodeURIComponent(row.state)}`
    );
  };

  const isEmpty = results.length === 0 && query && !loading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-6 relative">

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
        "
      >
        <Home className="w-6 h-6" />
      </button>
      <AccountButton /> 

      <div className="max-w-4xl mx-auto mt-12">

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Search Universities
        </h1>

        {/* Search + Filter Row */}
        <div className="flex gap-3 mb-6">

          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 z-10" 
              size={20} 
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a university..."
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


          {/* Filter Button */}
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

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl text-white space-y-4">
            <h2 className="text-xl font-semibold mb-3">Filter Results</h2>

            {/* State Filter */}
            <div>
              <label className="block mb-1 text-white/90">State</label>
              <input
                type="text"
                value={filters.state}
                onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))}
                className="
                  w-full px-4 py-2 rounded-lg
                  bg-white/20 text-white placeholder-white/60
                  border border-white/30
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                "
                placeholder="e.g., Maine"
              />
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">

          <table className="min-w-full text-left">
            <thead className="bg-white/20 border-b border-white/10 text-white/80">
              <tr>
                <th className="p-4">University</th>
                <th className="p-4">State</th>
              </tr>
            </thead>

            <tbody>
              {results.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(row)}
                  className="
                    cursor-pointer
                    hover:bg-blue-500/20
                    transition
                  "
                >
                  <td className="px-4 py-3 border-b border-white/10 text-white">{row.university}</td>
                  <td className="px-4 py-3 border-b border-white/10 text-white">{row.state}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Loading Spinner */}
          {/* {loading && (
            <div className="p-6 text-center text-white animate-pulse">
              Searching...
            </div>
          )} */}
        </div>

        {/* Empty State */}
        {isEmpty && (
          <p className="text-center text-white/70 mt-6 text-lg">
            No results found.
          </p>
        )}
      </div>
    </div>
  );
}
