import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // This includes Tailwind if you've set it up

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
