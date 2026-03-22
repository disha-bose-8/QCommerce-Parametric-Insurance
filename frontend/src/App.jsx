import { useState } from "react";
import Login from "./pages/Login";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  if (!role) return <Login setRole={setRole} />;

  if (role === "worker") return <WorkerDashboard setRole={setRole} />;
  if (role === "admin") return <AdminDashboard setRole={setRole} />;
}
<div className="bg-red-500 text-white p-10 text-3xl">
  IF YOU SEE RED → TAILWIND WORKS
</div>