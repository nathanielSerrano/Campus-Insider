import { useState } from "react";
import '../index.css'


const UniversityInfo = () => {
  return (
    <div>
      <h1>University Info Here!</h1>

      <table className="min-w-full bg-white border text-gray-800 border-gray-300">
        <trow>
          <th className="py-2 px-4 border-b">University</th>
          <th className="py-2 px-4 border-b">State</th>
        </trow>
        
      </table>
    </div>

  );
};

export default UniversityInfo;