/*import { useState } from "react";
import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";
import { RouterProvider } from 'react-router';
import { router } from './routes';


export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  if (!role) return <Login setRole={setRole} />;

  return <RouterProvider router={router} />;
  
  if (role === "admin") return <AdminDashboard setRole={setRole} />;
}
<div className="bg-red-500 text-white p-10 text-3xl">
  IF YOU SEE RED → TAILWIND WORKS
</div>*/

import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
