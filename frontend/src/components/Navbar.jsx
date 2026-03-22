export default function Navbar({ setRole }) {
  return (
    <div className="bg-black text-white p-4 flex justify-between">
      <h1>QShield Dashboard</h1>
      <button onClick={() => {
        localStorage.removeItem("role");
        setRole(null);
      }}>
        Logout
      </button>
    </div>
  );
}