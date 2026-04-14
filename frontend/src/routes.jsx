import { createBrowserRouter } from "react-router-dom";

// Worker Pages
import { StartPage } from "./pages/Worker_pages/StartPage";
import { LoginPage } from "./pages/Worker_pages/LoginPage";
import { RegisterPage } from "./pages/Worker_pages/RegisterPage";
import { DashboardLayout } from "./pages/Worker_pages/DashboardLayout";
import { HomePage } from "./pages/Worker_pages/HomePage";
import { CoveragePage } from "./pages/Worker_pages/CoveragePage";
import { PayoutsPage } from "./pages/Worker_pages/PayoutsPage";
import { AlertsPage } from "./pages/Worker_pages/AlertsPage";
import { ProfilePage } from "./pages/Worker_pages/ProfilePage";
import { PolicyConfirmationPage } from "./pages/Worker_pages/PolicyConfirmationPage";

import AdminDashboard from "./pages/Admin_pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <StartPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />, 
  },
   { 
    path: "/policy-confirmation/:id", 
    element: <PolicyConfirmationPage /> 
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "coverage", element: <CoveragePage /> },
      { path: "payouts", element: <PayoutsPage /> },
      { path: "alerts", element: <AlertsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);