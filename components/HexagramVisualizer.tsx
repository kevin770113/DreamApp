import React from 'react';

interface HexagramVisualizerProps {
  code: string; // e.g. "101100" (Top to Bottom), 1=Yang, 0=Yin
  color?: string;
}

const HexagramVisualizer: React.FC<HexagramVisualizerProps> = ({ code, color = "bg-amber-400" }) => {
  // Ensure we have exactly 6 chars, pad with 0 if necessary (fallback)
  const safeCode = (code || "000000").padEnd(6, '0').slice(0, 6);
  const lines = safeCode.split('');

  return (
    <div className="flex flex-col gap-2 w-24 mx-auto my-4 p-4 bg-mystic-900/50 rounded-lg border border-mystic-700/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
      {lines.map((bit, index) => (
        <div key={index} className="h-3 w-full flex justify-between">
          {bit === '1' ? (
            // Yang Line (Solid)
            <div className={`w-full h-full rounded-sm ${color} shadow-[0_0_8px_rgba(251,191,36,0.6)]`}></div>
          ) : (
            // Yin Line (Broken)
            <>
              <div className={`w-[42%] h-full rounded-sm ${color} opacity-80`}></div>
              <div className={`w-[42%] h-full rounded-sm ${color} opacity-80`}></div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default HexagramVisualizer;