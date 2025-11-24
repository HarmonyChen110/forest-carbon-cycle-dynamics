import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  title: string;
  children: React.ReactNode;
  explanation: React.ReactNode;
}

const ChartCard: React.FC<Props> = ({ title, children, explanation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          {title}
        </h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs"
        >
          <Info className="w-4 h-4" />
          {isExpanded ? '收起说明' : '图表说明'}
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="bg-blue-50 p-4 text-xs text-slate-700 border-b border-blue-100 leading-relaxed animate-in slide-in-from-top-2 duration-200">
          {explanation}
        </div>
      )}

      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;