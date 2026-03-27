import { createBrowserRouter } from "react-router";
// Worker Imports (These look correct based on your folder structure)
import { StartPage } from "./pages/Worker_pages/StartPage";
import { LoginPage } from "./pages/Worker_pages/LoginPage";
import { RegisterPage } from "./pages/Worker_pages/RegisterPage";
import { DashboardLayout } from "./pages/Worker_pages/DashboardLayout";
import { HomePage } from "./pages/Worker_pages/HomePage";
import { CoveragePage } from "./pages/Worker_pages/CoveragePage";
import { PayoutsPage } from "./pages/Worker_pages/PayoutsPage";
import { AlertsPage } from "./pages/Worker_pages/AlertsPage";
import { ProfilePage } from "./pages/Worker_pages/ProfilePage";

// FIXED: Added /Admin_pages/ to the path
import { AdminDashboard } from "./pages/Admin_pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: StartPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/admin",
    Component: AdminDashboard, // This was likely failing before
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "coverage", Component: CoveragePage },
      { path: "payouts", Component: PayoutsPage },
      { path: "alerts", Component: AlertsPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
]);