import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Home() {
    return (
        <div className="min-h-screen p-6 rgb(47,47,47)">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Campus Insider!</h2> 
        <div className="space-x-4 flex justify-center">
            <Link to="/search">
                <button className="text-white">
                    Search for a University 🔍
                </button>
            </Link>
        </div>
        </div>
    );
}

export default Home;