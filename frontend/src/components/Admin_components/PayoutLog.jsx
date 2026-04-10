import { DollarSign } from 'lucide-react';
import './WorkerList.css';

export default function PayoutLog({ payouts = [] }) {
  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="section-title-group">
          <DollarSign size={24} className="section-icon" />
          <h2>Recent Payouts</h2>
        </div>
        <span className="section-badge">
          ₹{totalAmount.toLocaleString()}
        </span>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Zone</th>
              <th>Trigger</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id}>
                <td className="worker-name">{payout.worker}</td>
                <td>{payout.zone}</td>
                <td>
                  <span className="trigger-badge">
                    {payout.trigger}
                  </span>
                </td>
                <td className="amount-cell">₹{payout.amount}</td>
                <td>{payout.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}