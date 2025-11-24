import React, { useState } from 'react';

const StockFlowDiagram: React.FC = () => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Helper to render description based on hover
  const getDescription = () => {
    switch (hoveredElement) {
      case 'Cveg': return '植被碳库 (Stock): 存储在植物生物量中的碳。变化率 dCveg/dt = NPP - Litter - Disturbance';
      case 'Csoil': return '土壤碳库 (Stock): 存储在土壤有机质中的碳。变化率 dCsoil/dt = Litter - Rh';
      case 'Catm': return '大气碳库 (Sink/Source): 系统的边界。本模型计算累积净交换量。';
      case 'GPP': return '总初级生产力 (Inflow): 大气碳进入植被的速率。GPP = εmax × APAR × f(T) × f(W)';
      case 'Ra': return '自养呼吸 (Outflow): 植物维持生命消耗的碳。Ra = α × GPP × Q10_func';
      case 'Litter': return '凋落 (Internal Flow): 碳从植被转移到土壤。Litter = k_lit × Cveg';
      case 'Rh': return '异养呼吸 (Outflow): 微生物分解土壤碳释放CO2。Rh = k_soil × Csoil × f(T) × f(W)';
      case 'Disturbance': return '人类干扰 (Outflow): 砍伐或土地利用变化导致的直接碳损失。H = h × HMI × Cveg';
      case 'Temp': return '温度驱动 (Driver): 通过 Q10 效应指数级增强呼吸作用 (Ra, Rh)，并在一定范围内促进光合作用。';
      case 'Water': return '水分驱动 (Driver): 通过气孔导度和微生物活性限制 GPP 和 Rh。';
      default: return '交互提示：将鼠标悬停在方框（存量）、沙漏（阀门）或圆圈（变量）上查看系统动力学机制。';
    }
  };

  // Reusable Valve Component (Hourglass)
  const Valve = ({ x, y, id }: { x: number, y: number, id: string }) => (
    <g transform={`translate(${x}, ${y})`} onMouseEnter={() => setHoveredElement(id)} onMouseLeave={() => setHoveredElement(null)} className="cursor-pointer group">
        <path d="M -8 -8 L 8 8 L -8 8 L 8 -8 Z" fill="white" stroke="#475569" strokeWidth="2" className="group-hover:stroke-emerald-600 group-hover:fill-emerald-50"/>
        <circle cx="0" cy="0" r="3" fill="#475569" className="group-hover:fill-emerald-600"/>
    </g>
  );

  // Double Line Pipe Component
  const Pipe = ({ d, color = "#94a3b8" }: { d: string, color?: string }) => (
    <path d={d} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" className="opacity-30" />
  );
  
  // Inner Flow Line
  const FlowLine = ({ d, color = "#475569" }: { d: string, color?: string }) => (
    <path d={d} fill="none" stroke={color} strokeWidth="2" markerEnd="url(#arrowhead)" />
  );

  return (
    <div className="w-full h-full flex flex-col items-center bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="w-full flex justify-between items-start mb-4 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800">系统动力学结构图 (System Structure)</h3>
          <p className="text-xs text-slate-500">Forrester Notation: Stocks (Box), Flows (Double Line + Valve), Information (Single Line)</p>
        </div>
        <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded max-w-md">
          <strong>当前聚焦：</strong> {getDescription()}
        </div>
      </div>

      <svg width="100%" height="450" viewBox="0 0 800 400" className="max-w-4xl select-none">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
          </marker>
          <marker id="arrowhead-info" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>

        {/* --- Layer 1: Atmosphere (Top) --- */}
        <path 
          d="M 300 60 Q 350 20 400 50 Q 450 20 500 60 Q 550 50 560 80 Q 570 110 520 120 L 330 120 Q 290 110 300 60" 
          fill="#f8fafc" 
          stroke="#64748b" 
          strokeWidth="2"
          strokeDasharray="5,5"
          onMouseEnter={() => setHoveredElement('Catm')}
          onMouseLeave={() => setHoveredElement(null)}
          className="cursor-pointer hover:stroke-blue-500"
        />
        <text x="430" y="95" textAnchor="middle" className="text-sm font-bold fill-slate-600 pointer-events-none">大气 (Atmosphere)</text>

        {/* --- Layer 2: Ecosystem Stocks (Bottom) --- */}
        
        {/* Cveg Stock */}
        <rect 
          x="150" y="250" width="140" height="80" 
          fill="#dcfce7" stroke="#16a34a" strokeWidth="3"
          onMouseEnter={() => setHoveredElement('Cveg')}
          onMouseLeave={() => setHoveredElement(null)}
          className="cursor-pointer hover:fill-green-200"
        />
        <text x="220" y="290" textAnchor="middle" className="text-sm font-bold fill-green-900 pointer-events-none">植被碳库</text>
        <text x="220" y="310" textAnchor="middle" className="text-xs font-mono fill-green-800 pointer-events-none">C_veg</text>

        {/* Csoil Stock */}
        <rect 
          x="550" y="250" width="140" height="80" 
          fill="#fef3c7" stroke="#d97706" strokeWidth="3" 
          onMouseEnter={() => setHoveredElement('Csoil')}
          onMouseLeave={() => setHoveredElement(null)}
          className="cursor-pointer hover:fill-amber-200"
        />
        <text x="620" y="290" textAnchor="middle" className="text-sm font-bold fill-amber-900 pointer-events-none">土壤碳库</text>
        <text x="620" y="310" textAnchor="middle" className="text-xs font-mono fill-amber-800 pointer-events-none">C_soil</text>

        {/* --- Flows (Double Lines + Valves) --- */}

        {/* 1. GPP: Atmosphere -> Cveg */}
        <Pipe d="M 380 120 C 320 120, 220 150, 220 250" color="#86efac" />
        <FlowLine d="M 380 120 C 320 120, 220 150, 220 245" />
        <Valve x={270} y={170} id="GPP" />
        <text x={300} y={175} className="text-xs font-bold fill-green-700">GPP</text>

        {/* 2. Ra: Cveg -> Atmosphere */}
        <Pipe d="M 250 250 C 250 200, 400 200, 420 120" color="#cbd5e1" />
        <FlowLine d="M 250 250 C 250 200, 400 200, 415 125" />
        <Valve x={330} y={220} id="Ra" />
        <text x={350} y={225} className="text-xs font-bold fill-slate-600">Ra</text>

        {/* 3. Litter: Cveg -> Csoil */}
        <Pipe d="M 290 290 L 550 290" color="#fdba74" />
        <FlowLine d="M 295 290 L 545 290" />
        <Valve x={420} y={290} id="Litter" />
        <text x={410} y={275} className="text-xs font-bold fill-amber-800">Litter</text>

        {/* 4. Rh: Csoil -> Atmosphere */}
        <Pipe d="M 600 250 C 600 180, 500 150, 480 120" color="#cbd5e1" />
        <FlowLine d="M 600 250 C 600 180, 500 150, 480 125" />
        <Valve x={550} y={180} id="Rh" />
        <text x={570} y={185} className="text-xs font-bold fill-slate-600">Rh</text>

        {/* 5. Disturbance: Cveg -> Outside */}
        <Pipe d="M 150 300 L 50 300" color="#fca5a5" />
        <FlowLine d="M 150 300 L 55 300" color="#dc2626" />
        <Valve x={100} y={300} id="Disturbance" />
        <text x={90} y={325} className="text-xs font-bold fill-red-600">H (Interference)</text>

        {/* --- Drivers (Variables) --- */}
        <g transform="translate(420, 360)" onMouseEnter={() => setHoveredElement('Temp')} onMouseLeave={() => setHoveredElement(null)} className="cursor-pointer">
          <circle cx="0" cy="0" r="18" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" className="text-xs font-bold fill-red-800">Temp</text>
        </g>

        <g transform="translate(500, 360)" onMouseEnter={() => setHoveredElement('Water')} onMouseLeave={() => setHoveredElement(null)} className="cursor-pointer">
          <circle cx="0" cy="0" r="18" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" className="text-xs font-bold fill-blue-800">Water</text>
        </g>

        {/* --- Information Links (Single Lines) --- */}
        {/* T -> GPP */}
        <path d="M 405 350 Q 300 350 270 178" stroke="#3b82f6" strokeWidth="1" fill="none" markerEnd="url(#arrowhead-info)" />
        {/* T -> Ra */}
        <path d="M 410 345 Q 350 280 330 228" stroke="#3b82f6" strokeWidth="1" fill="none" markerEnd="url(#arrowhead-info)" />
        {/* T -> Rh */}
        <path d="M 435 350 Q 500 250 550 190" stroke="#3b82f6" strokeWidth="1" fill="none" markerEnd="url(#arrowhead-info)" />
        
        {/* W -> GPP */}
        <path d="M 490 345 Q 450 250 280 175" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,2" fill="none" markerEnd="url(#arrowhead-info)" />
        {/* W -> Rh */}
        <path d="M 510 345 Q 560 250 555 195" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,2" fill="none" markerEnd="url(#arrowhead-info)" />

        {/* --- Feedback Loops Signs --- */}
        {/* Positive Feedback loop on vegetation growth (simplified) */}
        <g transform="translate(200, 200)">
           <circle r="8" fill="none" stroke="#94a3b8" />
           <text x="0" y="4" textAnchor="middle" className="text-xs font-bold fill-slate-500">+</text>
        </g>
        
        {/* Negative Feedback loop on respiration */}
        <g transform="translate(620, 200)">
           <circle r="8" fill="none" stroke="#94a3b8" />
           <text x="0" y="4" textAnchor="middle" className="text-xs font-bold fill-slate-500">-</text>
        </g>

      </svg>
    </div>
  );
};

export default StockFlowDiagram;