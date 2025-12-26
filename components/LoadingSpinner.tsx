import React, { useState, useEffect } from 'react';
import { Sparkles, ScrollText, Brain, Zap, Wifi } from 'lucide-react';

const loadingStates = [
  { text: "正在連結星辰與潛意識...", icon: <Sparkles className="w-12 h-12 text-mystic-300" /> },
  { text: "與周公對弈中...", icon: <ScrollText className="w-12 h-12 text-amber-400" /> },
  { text: "與佛洛伊德激烈討論中...", icon: <Brain className="w-12 h-12 text-slate-400" /> },
  { text: "水晶球充電中...", icon: <Zap className="w-12 h-12 text-yellow-400" /> },
  { text: "腦神經WIFI正在配對中...", icon: <Wifi className="w-12 h-12 text-teal-400" /> }
];

const LoadingSpinner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // We want to fade out, change text, fade in.
    // Total cycle: 3000ms.
    // 0-500ms: Fade In
    // 500-2500ms: Stay
    // 2500-3000ms: Fade Out
    
    const cycleDuration = 3000;
    
    const interval = setInterval(() => {
      // Start fade out
      setOpacity(0);
      
      setTimeout(() => {
        // Change content after fade out completes (e.g. 500ms transition)
        setCurrentIndex((prev) => (prev + 1) % loadingStates.length);
        // Start fade in
        setOpacity(1);
      }, 500); // Wait for CSS transition to finish

    }, cycleDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8 min-h-[300px]">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-mystic-600/30 rounded-full animate-[spin_8s_linear_infinite]"></div>
        <div className="absolute inset-2 border-4 border-t-gold-500/50 border-transparent rounded-full animate-[spin_4s_linear_infinite_reverse]"></div>
        
        {/* Center Icon with breathing transition */}
        <div 
          className="transition-all duration-500 transform ease-in-out"
          style={{ opacity: opacity, transform: `scale(${opacity ? 1 : 0.8})` }}
        >
          {loadingStates[currentIndex].icon}
        </div>
      </div>
      
      <div className="h-12 flex items-center justify-center overflow-hidden px-4">
        <p 
          className="text-mystic-100 font-serif text-xl text-center transition-opacity duration-500"
          style={{ opacity: opacity }}
        >
          {loadingStates[currentIndex].text}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;