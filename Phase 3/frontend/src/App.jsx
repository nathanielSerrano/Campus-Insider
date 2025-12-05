import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UniversityInfo from "./pages/UniversityInfo";
import LocationInfo from "./pages/LocationInfo";
import SearchResults from './pages/SearchResults'
import Ratings from './pages/Ratings';
import Home from './pages/Home';

function App() {

  return (
    <>
      {/* <h1 className="text-3xl font-bold text-blue-500">
        Welcome to Campus Insider!
      </h1>
      <p>Backend says: {msg}</p>
      <br></br> */}
      {/* <button onClick={() => navigate("/search")} className="">
        Search for a University 🔍
      </button> */}
      <Router>


      <div className="min-h-screen min-w-screen overflow-hidden">
         {/* Navigation menu */}
         {/* <nav className="mb-6 space-x-4">
           <Link to="/" className="text-blue-600 hover:underline">Home</Link>
           <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
           <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
           <Link to="/university" className="text-blue-600 hover:underline">University</Link>
           <Link to="/location" className="text-blue-600 hover:underline">Location</Link>
           <Link to="/search" className="text-blue-600 hover:underline">Search</Link>
           <Link to="/ratings" className="text-blue-600 hover:underline">Ratings</Link>
         </nav> */}



         {/* Page content */}
         <main>
           <Routes>
             <Route path="/" element={<Home />} />
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/university/:name" element={<UniversityInfo />} />
             <Route path="/location" element={<LocationInfo />} />
             <Route path="/search" element={<SearchResults />} />
             <Route path="/ratings" element={<Ratings />} />
           </Routes>
         </main>
       </div>
     </Router>
    </>
  );

}
 
export default App;
