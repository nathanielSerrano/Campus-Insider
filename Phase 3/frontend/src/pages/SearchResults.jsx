import { useState } from "react";

const SearchResults = () => {
    const [search, setSearch] = useState("");
return (
    <div>

        <table className="min-w-full bg-white border text-gray-800 border-gray-300">
        <thead> 
            <input
                id="search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search for a University... 🔍"
                required
            /> 
            </thead>
        <trow>
            <th className="py-2 px-4 border-b">University Name</th>
            <th className="py-2 px-4 border-b">State</th>

        </trow>
        </table>
    </div>

    );
};

export default SearchResults;