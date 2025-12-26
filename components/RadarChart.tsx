import React from 'react';

interface RadarChartProps {
  data: {
    iching: number;
    almanac: number;
    gypsy: number;
    freud: number;
    neuroscience: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const size = 200;
  const center = size / 2;
  const radius = 70; // Leave some padding for labels
  const levels = 5; // 1 to 5 scale

  const axes = [
    { label: '易經', key: 'iching' as const },
    { label: '農民曆', key: 'almanac' as const },
    { label: '吉普賽', key: 'gypsy' as const },
    { label: '心理學', key: 'freud' as const },
    { label: '腦科學', key: 'neuroscience' as const },
  ];

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number, max: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2; // Start from top (-90deg)
    const r = (value / max) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate grid points (pentagons)
  const gridPolygons = Array.from({ length: levels }).map((_, i) => {
    const level = i + 1;
    const points = axes.map((_, index) => {
      const { x, y } = getCoordinates(level, index, levels);
      return `${x},${y}`;
    }).join(' ');
    return points;
  });

  // Generate data polygon
  const dataPoints = axes.map((axis, index) => {
    const value = data[axis.key];
    const { x, y } = getCoordinates(value, index, levels);
    return `${x},${y}`;
  }).join(' ');

  // Labels
  const labels = axes.map((axis, index) => {
    // Push labels out a bit further than radius
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const labelRadius = radius + 20;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y, text: axis.label };
  });

  return (
    <div className="flex justify-center items-center py-4">
      <div className="relative w-full max-w-[300px] aspect-square">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-lg">
          {/* Background Grid (Pentagons) */}
          {gridPolygons.map((points, i) => (
            <polygon
              key={i}
              points={points}
              fill="transparent"
              stroke="#5b3ea8" // mystic-600
              strokeWidth="1"
              opacity={0.3}
            />
          ))}

          {/* Axes Lines */}
          {axes.map((_, index) => {
            const { x, y } = getCoordinates(levels, index, levels);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#5b3ea8"
                strokeWidth="1"
                opacity={0.3}
              />
            );
          })}

          {/* Data Polygon */}
          <polygon
            points={dataPoints}
            fill="rgba(251, 191, 36, 0.3)" // gold-400 with opacity
            stroke="#fbbf24" // gold-400
            strokeWidth="2"
            className="filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse"
          />

          {/* Data Points (Dots) */}
          {axes.map((axis, index) => {
            const value = data[axis.key];
            const { x, y } = getCoordinates(value, index, levels);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#fbbf24"
              />
            );
          })}

          {/* Labels */}
          {labels.map((label, index) => (
            <text
              key={index}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-mystic-100 font-serif"
              style={{ fontSize: '10px' }}
            >
              {label.text}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default RadarChart;