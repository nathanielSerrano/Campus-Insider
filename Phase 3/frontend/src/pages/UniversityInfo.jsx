import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { Home, Search } from "lucide-react";
import PaginatedTable from "../components/PaginatedTable";
import AccountButton from "../components/AccountButton";
import { useAuth } from "../context/AuthContext";



const UniversityInfo = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const location = useLocation();
  // const user = localStorage.getItem("username");
  // const user = "admin"; // For testing admin features
  const user = useAuth().user;
  const showAdminFeatures = user && user.email === "admin";

  const [locationType, setLocationType] = useState("Room");
  const [locationName, setLocationName] = useState("");
  const [campusName, setCampusName] = useState("");
  const [buildingName, setBuildingName] = useState("");

  const [message, setMessage] = useState(null);

  // Extract state from query string (ex: ?state=California)
  const searchParams = new URLSearchParams(location.search);
  const state = searchParams.get("state");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    name: "",
    type: "Room",
    notes: ""
  });

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
  const handleRowClick = (loc, university) => {
    // 1) prefer db_location_name when backend provides it
    let trueLocation = loc.db_location_name || "";

    // 2) if not provided, try to normalize the display name:
    //    "BEH - Room 1000"  => "BEH 1000"
    //    "BEH - Room 1000 (something)" -> still try to replace first occurrence
    if (!trueLocation && loc.location_name) {
      // Replace " - Room " with " " (single space)
      if (loc.location_name.includes(" - Room ")) {
        trueLocation = loc.location_name.replace(" - Room ", " ");
      } else {
        // fallback: remove " - " but only if it looks like <building> - <room>
        // we'll conservatively replace " - " with " " if it contains numbers
        const maybe = loc.location_name.replace(" - ", " ");
        if (/\d/.test(maybe)) {
          trueLocation = maybe;
        } else {
          // last resort: use the raw display name (backend has tolerant checks)
          trueLocation = loc.location_name;
        }
      }
    }

    // If still empty (shouldn't happen) fall back to location_name
    if (!trueLocation) trueLocation = loc.location_name || "";

    // Build URL: include the display label in &room for the backend as extra help
    const url =
      `/ratings?location=${encodeURIComponent(trueLocation)}` +
      `&university=${encodeURIComponent(university)}` +
      `&campus=${encodeURIComponent(loc.campus_name || "")}` +
      `&room=${encodeURIComponent(loc.location_name || "")}`;

    // debug (remove after verifying)
    // console.log('navigate to', url, { loc });

    navigate(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();   // Prevents page reload
  
    setLoading(true);     // Shows "Submitting..."
    setMessage(null);     // Clears previous messages
  
    const payload = {
      room_name: locationName,
      university_name: uni.name,
      state: uni.state,
      campus_name: campusName,
      building_name: locationType === "Room" ? buildingName : null,
      requested_by_username: localStorage.getItem("username"),
      location_type: locationType, // Added for frontend logic, backend optional
    };
  
    try {
      const res = await fetch("/api/request-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
  
      // Show success
      setMessage({ type: "success", text: data.message });
  
      // Clear fields
      setLocationName("");
      setCampusName("");
      setBuildingName("");
  
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  
    setLoading(false);
  };
  

  const columns = [
    { label: "Location Name", key: "location_name" },
    { label: "Type", key: "location_type" },
    { label: "Campus", key: "campus_name" },
  ];

  const typeRequiresBuilding = locationType === "Room";





  return (
<div className="relative z-40 min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-8 flex justify-center">
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
      <div className="max-w-4xl w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl text-white">



        {/* Header */}
        <h1 className="text-4xl font-bold mb-4 text-center">
          {uni?.name} <span className="text-slate-300">({uni?.state})</span>
        </h1>

        {/* Wiki Link */}
        {uni?.wiki_url && (
          <p className="mb-6">
            <a
              href={uni.wiki_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-400 underline"
            >
              View on Wikipedia
            </a>
          </p>
        )}

        {/* Search Locations Button */}

        <button
          onClick={handleLocationSearch}
          className="px-6 py-3 bg-green-500 flex hover:bg-green-600 text-white rounded-xl font-medium transition shadow-lg shadow-green-900/30 mb-10 hover:scale-[1.03]"
        >             <Search size={20} /> &nbsp;
          Search for a Location
        </button>

        {/* Campuses Section */}
        <h2 className="text-2xl font-semibold mb-3">Campuses</h2>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-10">
          {campuses.length === 0 ? (
            <p className="text-slate-300">No campus data available.</p>
          ) : (
            <ul className="list-disc ml-6 text-slate-200">
              {campuses.map((c, i) => (
                <li key={i}>{c.campus_name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Locations Section */}
        <h2 className="text-2xl font-semibold mb-3">Campus Locations</h2>


        <div className="overflow-x-auto">
          <PaginatedTable
            data={locations}
            columns={columns}
            rowsPerPage={10}           // show 10 entries per page
            onRowClick={(loc) => handleRowClick(loc, uni.name)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
          {/* Request New Location Section */}
          {/* <div className="mt-12 bg-white/10 border border-white/20 p-6 rounded-2xl backdrop-blur-md shadow-xl"> */}


{!showRequestForm && (
  <button
    onClick={() => setShowRequestForm(true)}
    className="
      px-5 py-3 mt-4 bg-blue-500 hover:bg-blue-600
      text-white rounded-xl font-medium transition
      shadow-lg shadow-blue-900/30 hover:scale-[1.03]
    "
  >
    Request Location
  </button>
)}

{showRequestForm && (
  <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">

    <h2 className="text-2xl font-semibold text-white mb-3">
      Request a New Location
    </h2>

    <p className="text-white/70 mb-6">
    Can't find a room, building, or other location? Submit a request and our
    team will review it.
    </p>

    <form onSubmit={handleSubmit}   className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Location Type */}
      <div>
        <label className="block text-white/60 mb-1">Location Type</label>
        <select
          className="w-full p-2 rounded-lg bg-white/10 border border-white/10 text-white"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value)}
        >
          <option value="Room">Room</option>
          <option value="Building">Building</option>
          <option value="Campus">Campus</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Location Name */}
      <div>
        <label className="block text-white/60 mb-1">Location Name</label>
        <input
          className="w-full p-2 rounded-lg bg-white/10 border border-white/10 text-white"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          required
        />
      </div>

      {/* Campus Name */}
      <div>
        <label className="block text-white/60 mb-1">Campus Name</label>
        <input
          className="w-full p-2 rounded-lg bg-white/10 border border-white/10 text-white"
          value={campusName}
          onChange={(e) => setCampusName(e.target.value)}
          required
        />
      </div>

      {/* Building Name (conditional) */}
      {typeRequiresBuilding && (
        <div className="md:col-span-3">
          <label className="block text-white/60 mb-1">Building Name</label>
          <input
            className="w-full p-2 rounded-lg bg-white/10 border border-white/10 text-white"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            required
          />
        </div>
      )}

      <div className="md:col-span-3">
        <label className="block text-white/60 mb-1">Additional Notes (optional)</label>
        <textarea
          className="w-full p-2 rounded-lg bg-white/10 border border-white/10 text-white"
          value={requestData.notes}
          onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
          rows={4}
          placeholder="Describe the location or why it should be added..."
          />
      </div>

      {/* Submit Button */}
      <div className="md:col-span-3 flex justify-end mt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white 
                     disabled:opacity-50 transition-all"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>

    {/* Message */}
    {message && (
      <div
        className={`mt-6 p-3 rounded-lg ${
          message.type === "success"
            ? "bg-green-500/20 text-green-300"
            : "bg-red-500/20 text-red-300"
        }`}
      >
        {message.text}
      </div>
    )}

  </div>
)}

{showAdminFeatures && (
  <div className="mt-12">
    <h2 className="text-2xl font-semibold text-white mb-3">
      Admin Location Management
    </h2>
    <button
      // onClick={() => navigate(`/admin/locations?university=${encodeURIComponent(uni.name)}&state=${encodeURIComponent(uni.state)}`)}
      className="
        px-5 py-3 bg-red-500 hover:bg-red-600
        text-white rounded-xl font-medium transition
        shadow-lg shadow-red-900/30 hover:scale-[1.03]
      "
    >
      Manage Locations
    </button>
    
  </div>
)}
          </div>
        </div>
      </div>
    // </div>
  );
}   

export default UniversityInfo;