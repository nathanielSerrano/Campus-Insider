import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import AccountButton from "../components/AccountButton";
import { useAuth } from "../context/AuthContext";




function Home() {
    const signedIn = useAuth().user;

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center px-6">

            {/* Top-right auth buttons */}
            {!signedIn && (
                <div className="absolute top-6 right-6 flex gap-4">
                    <Link to="/login">
                        <button className="
            px-4 py-2
            bg-white/20 hover:bg-white/30
            text-white font-medium
            rounded-lg
            backdrop-blur-md
            transition
          ">
                            Log In
                        </button>
                    </Link>

                    <Link to="/register">
                        <button className="
            px-4 py-2
            bg-blue-500 hover:bg-blue-600
            text-white font-semibold
            rounded-lg
            shadow-md
            transition
          ">
                            Sign Up
                        </button>
                    </Link>

                </div>
            )}
            {signedIn && (

                <div className="absolute top-6 right-6 z-50 flex gap-4">
                    <AccountButton />
                </div>)}



            {/* Main card */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl max-w-xl text-center">

                <h1 className="text-4xl font-bold text-white mb-4">
                    Campus Insider
                </h1>

                <p className="text-slate-200 text-lg mb-8">
                Discover the best study spots, classrooms, and campus spaces, reviewed by the people who use them.
                </p>

                <Link to="/search" className="flex justify-center">
                    <button
                        className="
      px-6 py-3 
      text-lg font-medium 
      bg-blue-500 hover:bg-blue-600 
      text-white rounded-xl 
      shadow-lg shadow-blue-900/30
      transition-all 
      hover:scale-[1.03]
      flex items-center gap-2
    "
                    >
                        <Search size={20} />
                        Search for a University
                    </button>
                </Link>

            </div>
        </div>
    );
}

export default Home;
