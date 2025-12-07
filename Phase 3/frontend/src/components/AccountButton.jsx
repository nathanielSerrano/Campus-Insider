import { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccountButton() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const location = useLocation();


  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  if (!user) return null; // hide if logged out

  const onHomePage = location.pathname === "/";


  // Close panel when clicking outside
  useEffect(() => {

    const handleClick = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);


  return (
    <div className={`absolute z-50 top-6 ${
        onHomePage ? "right-6" : "right-20"
      }`}>
      {/* User icon button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="
          text-white bg-white/10 hover:bg-white/20
          p-3 rounded-xl backdrop-blur-md
          border border-white/20
          transition-all hover:scale-105
          flex items-center justify-center
          z-50

          
        "
      >
        <User className="w-6 h-6" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="
            absolute mt-2 right-0
            bg-slate-800/90 text-white
            rounded-xl shadow-xl border border-white/20
            backdrop-blur-md
            p-4 w-auto max-w min-w-40
            animate-slideDown
            z-50
          "
        >
          <p className="text-sm text-gray-300 mb-3">
            Signed in as <span className="font-semibold">{user.email}</span>
          </p>

          <button
            onClick={() => { logout(); navigate("/"); }}
            className="
              w-full flex items-center gap-2
              bg-red-500/20 hover:bg-red-500/30
              text-red-200 px-3 py-2 rounded-lg
              transition
            "
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
