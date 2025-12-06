// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { PLASMIC } from "./plasmic-init";
import { PlasmicRootProvider } from "@plasmicapp/loader-react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PlasmicRootProvider loader={PLASMIC}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PlasmicRootProvider>
  </React.StrictMode>
);
