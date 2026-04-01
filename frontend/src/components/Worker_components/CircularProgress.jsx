import React from 'react';
import './CircularProgress.css';

export function CircularProgress({ percentage, size = 100, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const color = percentage >= 70 ? '#ef4444' : percentage >= 40 ? '#f97316' : '#22c55e';

  return (
    <div className="circular-progress" style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="progress-content" style={{ position: 'absolute', textAlign: 'center' }}>
        <span className="progress-percentage" style={{ color, fontSize: '0.9rem', fontWeight: 'bold', display: 'block' }}>{percentage}%</span>
      </div>
    </div>
  );
}