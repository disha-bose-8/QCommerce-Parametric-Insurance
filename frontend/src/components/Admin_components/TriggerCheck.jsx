import { useState } from "react";

export default function TriggerCheck() {
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);

    try {
      await fetch("https://qshield-backend-nf8y.onrender.com/api/payout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          worker_id: 1,
          amount: 500,
          trigger_type: "ADMIN_SIMULATION",
          audit_msg: "Global Trigger Simulation"
        })
      });

      alert("🔥 Global payout triggered!");

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleTrigger} disabled={loading}>
        {loading ? "Simulating..." : "Global Payout Trigger"}
      </button>
    </div>
  );
}