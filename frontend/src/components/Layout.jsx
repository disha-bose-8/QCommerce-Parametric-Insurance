export default function Layout({ children, setRole }) {
  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white flex flex-col p-6">

        <h1 className="text-2xl font-bold mb-10">QShield</h1>

        <nav className="flex flex-col gap-4 text-sm">
          <p className="hover:text-gray-300 cursor-pointer">Dashboard</p>
          <p className="hover:text-gray-300 cursor-pointer">Triggers</p>
          <p className="hover:text-gray-300 cursor-pointer">Analytics</p>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("role");
            setRole(null);
          }}
          className="mt-auto bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}