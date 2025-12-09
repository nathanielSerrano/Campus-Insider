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
import Admin from './pages/Admin'

function App() {

  return (
    <>
      <Router>
      <div className="min-h-screen min-w-screen overflow-hidden">
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
              <Route path="/admin" element={<Admin />} />
           </Routes>
         </main>
       </div>
     </Router>
    </>
  );

}
 
export default App;
