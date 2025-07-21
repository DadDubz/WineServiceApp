import AddWineForm from "../components/AddWineForm";
import React, { useState } from "react";

const Wines = () => {
  const [wines, setWines] = useState([]);

  return (
	<div>
	  <AddWineForm onAdd={(newWine) => setWines([...wines, newWine])} />
	  {/* You can render the list of wines here if needed */}
	</div>
  );
};

export default Wines;
