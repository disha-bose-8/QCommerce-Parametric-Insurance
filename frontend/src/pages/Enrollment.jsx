import { useState } from "react";
import API from "../services/api";

export default function Enrollment() {
  const [days, setDays] = useState("");
  const [res, setRes] = useState(null);

  const check = async () => {
    const r = await API.get("/eligibility", {
      params: { active_days: days },
    });
    setRes(r.data);
  };

  return (
    <div className="p-6">
      <input
        placeholder="Active Days"
        className="border p-2 mr-2"
        onChange={(e) => setDays(e.target.value)}
      />

      <button onClick={check} className="bg-purple-500 text-white px-4 py-2">
        Check
      </button>

      {res && <p>{res.message}</p>}
    </div>
  );
}