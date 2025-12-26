import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AnalysisCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  colorClass: string; // Used for border/accent
  bgClass: string;    // Used for background
  isExpanded: boolean;
  onToggle: () => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ 
  title, 
  icon, 
  children, 
  colorClass, 
  bgClass,
  isExpanded,
  onToggle
}) => {
  return (
    <div 
      className={`backdrop-blur-md border rounded-xl shadow-lg transition-colors duration-500 overflow-hidden ${colorClass} ${bgClass}`}
    >
      {/* Header - Always Visible */}
      <div 
        onClick={onToggle}
        className="flex items-center justify-between p-6 cursor-pointer active:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black/30 text-gold-400 group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
          <h3 className="text-xl font-serif font-bold text-gray-100">{title}</h3>
        </div>
        <button 
          className={`p-1 rounded-full border border-white/20 text-white/70 transition-transform duration-700 ease-in-out ${isExpanded ? 'rotate-180 bg-white/10' : ''}`}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Content - Collapsible using Grid technique for smooth height animation */}
      <div 
        className={`grid transition-[grid-template-rows] duration-700 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div 
            className={`px-6 pb-6 pt-0 text-gray-300 space-y-3 border-t border-white/10 mt-2 transition-opacity duration-700 delay-200 ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="pt-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;