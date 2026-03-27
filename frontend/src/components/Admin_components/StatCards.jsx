import { Users, FileText, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import './StatCards.css';

export default function StatCards({ stats }) {
  const cards = [
    {
      label: 'Active Policies',
      value: stats.active_policies.toLocaleString(),
      icon: FileText,
      color: '#6366f1',
    },
    {
      label: 'Total Workers',
      value: stats.total_workers.toLocaleString(),
      icon: Users,
      color: '#8b5cf6',
    },
    {
      label: 'Weekly Premium Pool',
      value: `₹${(stats.weekly_premium_pool / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: '#22c55e',
    },
    {
      label: 'Total Payouts',
      value: `₹${(stats.total_payouts / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: '#f97316',
    },
    {
      label: 'Loss Ratio',
      value: `${(stats.loss_ratio * 100).toFixed(0)}%`,
      icon: AlertTriangle,
      color: stats.loss_ratio > 0.6 ? '#ef4444' : '#22c55e',
    },
  ];

  return (
    <div className="stat-cards-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="stat-card"
            style={{ borderTopColor: card.color }}
          >
            <div
              className="stat-card-icon"
              style={{
                background: `${card.color}20`,
                color: card.color,
              }}
            >
              <Icon size={24} />
            </div>

            <div className="stat-card-content">
              <span className="stat-card-label">{card.label}</span>
              <span className="stat-card-value">{card.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}