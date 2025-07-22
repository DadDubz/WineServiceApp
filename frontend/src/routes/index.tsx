import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/LoginPage";
// Update the import path if the Dashboard file is named differently or located elsewhere
import Dashboard from "../pages/DashboardPage";
// Or, if the file is named Dashboard.tsx, ensure the file exists at ../pages/Dashboard.tsx

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/login", element: <LoginPage /> },
    ],
  },
]);
