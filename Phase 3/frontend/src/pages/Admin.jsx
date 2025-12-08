import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import PaginatedTable from "../components/PaginatedTable";
import AccountButton from "../components/AccountButton";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Users / Requests
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // University / Campus / Building management
  const [universities, setUniversities] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [universityState, setUniversityState] = useState("");
  const [universityWiki, setUniversityWiki] = useState("");
  const [campusName, setCampusName] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingEntities, setLoadingEntities] = useState(true);

  const showAdminFeatures = user && user.email === "admin";

  useEffect(() => {
    if (!showAdminFeatures) {
      navigate("/");
      return;
    }

    // Fetch users
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch room requests
    fetch("/api/admin/requested-rooms")
      .then((res) => res.json())
      .then((data) => setRequests(data.requests || []))
      .catch(console.error)
      .finally(() => setLoadingRequests(false));

    // Fetch universities
    fetch("/api/admin/universities")
      .then((res) => res.json())
      .then((data) => setUniversities(data.universities || []))
      .catch(console.error)
      .finally(() => setLoadingEntities(false));
  }, []);

  // Fetch campuses when a university is selected
  useEffect(() => {
    if (!selectedUniversity) return;
    fetch(`/api/admin/universities/${selectedUniversity}/campuses`)
      .then((res) => res.json())
      .then((data) => setCampuses(data.campuses || []))
      .catch(console.error);
  }, [selectedUniversity]);

  // Handlers
  const handleAddUniversity = async () => {
    if (!universityName || !universityState) {
      setSuccessMessage("University name and state are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: universityName,
          state: universityState,
          wiki_url: universityWiki || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add university");

      setUniversities((prev) => [...prev, data.university]);
      setUniversityName("");
      setUniversityState("");
      setUniversityWiki("");
      setSuccessMessage("University added successfully!");
    } catch (err) {
      console.error(err);
      setSuccessMessage(err.message);
    }
  };

  const handleAddCampus = async () => {
    if (!selectedUniversity || !campusName) {
      setSuccessMessage("University and campus name are required.");
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/universities/${selectedUniversity}/campuses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: campusName }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add campus");

      setCampuses((prev) => [...prev, data.campus]);
      setCampusName("");
      setSuccessMessage("Campus added successfully!");
    } catch (err) {
      console.error(err);
      setSuccessMessage(err.message);
    }
  };

  const handleAddBuilding = async () => {
    if (!selectedUniversity || !selectedCampus || !buildingName) {
      setSuccessMessage("University, campus, and building name are required.");
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/universities/${selectedUniversity}/campuses/${selectedCampus}/buildings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: buildingName }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add building");

      setBuildingName("");
      setSuccessMessage("Building added successfully!");
    } catch (err) {
      console.error(err);
      setSuccessMessage(err.message);
    }
  };

  const columns = [
    { header: "Email", accessor: "email" },
    { header: "University ID", accessor: "university_id" },
    { header: "Role", accessor: "role" },
  ];

  const requestColumns = [
    { header: "Request ID", accessor: "request_id" },
    { header: "Room Name", accessor: "room_name" },
    { header: "Building", accessor: "building_name" },
    { header: "Campus", accessor: "campus_name" },
    { header: "University", accessor: "university_name" },
    { header: "Requested By", accessor: "requested_by_email" },
    { header: "Status", accessor: "status" },
  ];

  return (
    <div className="relative z-40 min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-8 flex justify-center">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-white text-lg bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 z-50"
      >
        ← Back
      </button>
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 flex items-center justify-center z-50"
      >
        <Home className="w-6 h-6" />
      </button>
      <AccountButton />

      <div className="w-full max-w-5xl">
        <h1 className="text-3xl text-white mb-6">Admin Dashboard</h1>

        {/* Users Table */}
        <h2 className="text-2xl text-white mb-4">Users</h2>
        {loading ? (
          <p className="text-white">Loading users...</p>
        ) : (
          <PaginatedTable columns={columns} data={users} pageSize={10} />
        )}

        {/* Requested Rooms Table */}
        <h2 className="text-2xl text-white mt-10 mb-4">Requested Rooms</h2>
        {loadingRequests ? (
          <p className="text-white">Loading room requests...</p>
        ) : (
          <PaginatedTable columns={requestColumns} data={requests} pageSize={10} keyField="uid" />
        )}

        {/* Manage Universities / Campuses / Buildings */}
        <h2 className="text-2xl text-white mt-10 mb-4">Manage Universities / Campuses / Buildings</h2>
        {successMessage && <p className="text-green-400 mb-4">{successMessage}</p>}

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-6">
          {/* Add University */}
          <div>
            <h3 className="text-white font-semibold mb-2">Add University</h3>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="University Name"
                className="px-3 py-2 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                value={universityState}
                onChange={(e) => setUniversityState(e.target.value)}
                placeholder="State"
                className="px-3 py-2 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                value={universityWiki}
                onChange={(e) => setUniversityWiki(e.target.value)}
                placeholder="Wiki URL (optional)"
                className="px-3 py-2 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleAddUniversity}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                Add
              </button>
            </div>
          </div>

          {/* Add Campus */}
          <div>
            <h3 className="text-white font-semibold mb-2">Add Campus</h3>
            <div className="flex gap-2">
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select University</option>
                {universities.map((u) => (
                  <option key={u.university_id} value={u.university_id}>
                    {u.name} ({u.state})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                placeholder="Campus Name"
                className="flex-1 px-3 py-2 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleAddCampus}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                Add
              </button>
            </div>
          </div>

          {/* Add Building */}
          <div>
            <h3 className="text-white font-semibold mb-2">Add Building</h3>
            <div className="flex gap-2">
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select University</option>
                {universities.map((u) => (
                  <option key={u.university_id} value={u.university_id}>
                    {u.name} ({u.state})
                  </option>
                ))}
              </select>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Campus</option>
                {campuses.map((c) => (
                  <option key={c.campus_id} value={c.campus_id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="Building Name"
                className="flex-1 px-3 py-2 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleAddBuilding}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
