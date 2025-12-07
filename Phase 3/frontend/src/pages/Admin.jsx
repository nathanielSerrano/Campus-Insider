import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { Home, Search } from "lucide-react";
import PaginatedTable from "../components/PaginatedTable";
import AccountButton from "../components/AccountButton";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
    const user = useAuth().user;
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    
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
    }, []);

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
        { header: "Status", accessor: "status" }
    ];
    
    

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

      <div className="w-full max-w-5xl">
        <h1 className="text-3xl text-white mb-6">Admin Dashboard</h1>

        <h2 className="text-2xl text-white mb-4">Users</h2>
        {loading ? (
            <p className="text-white">Loading users...</p>
        ) : (
            <PaginatedTable columns={columns} data={users} pageSize={10} />
        )}

        <h2 className="text-2xl text-white mt-10 mb-4">Requested Rooms</h2>
        {loadingRequests ? (
            <p className="text-white">Loading room requests...</p>
        ) : (
            <PaginatedTable columns={requestColumns} data={requests} pageSize={10} keyField="uid"
/>
        )}
      </div>
    </div>
)

}
