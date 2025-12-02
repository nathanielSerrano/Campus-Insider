import React from "react";
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";


export default function SearchResults() {
    const navigate = useNavigate();

    // const dummyResults = [
    //   { university: "Harvard University", state: "MA", campus: "Cambridge" },
    //   { university: "Stanford University", state: "CA", campus: "Palo Alto" },
    //   { university: "University of Michigan", state: "MI", campus: "Ann Arbor" }
    // ];
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
      state: "",       // e.g., "California"
      campusType: ""   // e.g., "Main", "Satellite"
    });
    const [showFilters, setShowFilters] = useState(false);


    // useEffect(() => {
    //   fetch("/api/search")
    //     .then(res => res.json())
    //     .then(json => {
    //       console.log("Backend data:", json);
    //       setData(json.results);   // <— use the results array
    //     })
    //     .catch(err => console.error(err));
    // }, []);
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
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, [query, filters]);
  
    // const data = results.length > 0 ? results : dummyResults;
    console.log("Search Results Data:", data);


  
    const handleRowClick = (row) => {
      // Replace this with navigate(`/university/${row.id}`) later
      navigate(`/university/${encodeURIComponent(row.university)}?state=${encodeURIComponent(row.state)}`);
    };
  
    return (
      <div className="min-h-screen bg-rgb(47,47,47) p-8">
      <div className="flex items-center gap-2 mb-4">
  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search for a university..."
    className="border p-2 rounded flex-1"
  />

  <button
    onClick={() => setShowFilters((prev) => !prev)}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    Filter
  </button>
</div>

{showFilters && (
  <div className="bg-rgb(45,45,45) p-4 rounded mb-4">
    <label className="block mb-2">
      State:
      <input
        type="text"
        value={filters.state}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, state: e.target.value }))
        }
        className="border p-1 rounded ml-2"
      />
    </label>
  </div>
)}
      {loading && <p>Loading...</p>}
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-white">Search Results</h1>
  
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-left">
                <thead className="bg-gray-300 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-gray-700">University</th>
                    <th className="p-4 font-semibold text-gray-700">State</th>
                    {/* <th className="p-4 font-semibold text-gray-700">Campus</th> */}
                  </tr>
                </thead>
  
                <tbody>
                {results.map((row, idx) => (
                <tr
                  key={idx}
                  className="cursor-pointer hover:bg-blue-100 transition"
                  onClick={() => handleRowClick(row)}
                >
                  <td className="px-4 py-2 border-b text-gray-700">{row.university}</td>
                  <td className="px-4 py-2 border-b text-gray-700">{row.state}</td>
                  {/* <td className="px-4 py-2 border-b text-gray-700">{row.campus}</td> */}
                </tr>
              ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
  