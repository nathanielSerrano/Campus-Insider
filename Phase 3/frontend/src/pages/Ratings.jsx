import { useState } from "react";

const Ratings = () => {
  const searchParams = new URLSearchParams(location.search);
  const locationName = searchParams.get("location");
  const university = searchParams.get("university");
  return (
    <div>
      <h1>Ratings Info here!</h1>
    </div>
  );
};

export default Ratings;