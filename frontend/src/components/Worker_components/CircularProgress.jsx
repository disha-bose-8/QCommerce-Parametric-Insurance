import './CircularProgress.css';

export function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  label 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 70) return '#ef4444'; // red
    if (percentage >= 40) return '#f97316'; // orange
    return '#22c55e'; // green
  };

  const color = getColor();

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="progress-circle"
        />
      </svg>

      <div className="progress-content">
        <div className="progress-percentage" style={{ color }}>
          {percentage}%
        </div>

        {label && (
          <div className="progress-label">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}