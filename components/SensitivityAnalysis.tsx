import React from 'react';
import { SensitivityResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface Props {
  data: SensitivityResult[];
}

const SensitivityAnalysis: React.FC<Props> = ({ data }) => {
  // Transform data for Tornado Chart
  // We want to show the range of impact. 
  // For visualization, we can plot the "Change" values.
  
  const chartData = data.map(item => ({
    name: item.label,
    low: item.changeLow,
    high: item.changeHigh,
    range: Math.abs(item.changeHigh - item.changeLow)
  })).sort((a, b) => b.range - a.range); // Sort by magnitude of impact

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-2">参数敏感性分析 (Sensitivity Analysis)</h3>
      <p className="text-xs text-slate-500 mb-6">
        展示各参数变动 ±10% 时，对系统总碳储量（植被+土壤）的百分比影响。长条越长，说明系统对该参数越敏感。
      </p>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" unit="%" domain={['auto', 'auto']} />
            <YAxis dataKey="name" type="category" width={100} style={{fontSize: '12px', fontWeight: 500}} />
            <Tooltip 
                cursor={{fill: 'transparent'}}
                formatter={(value: number) => `${value.toFixed(2)}%`}
            />
            <ReferenceLine x={0} stroke="#94a3b8" />
            
            {/* We use two bars to simulate the tornado range */}
            <Bar dataKey="low" name="-10% 参数变动" fill="#3b82f6" barSize={20} />
            <Bar dataKey="high" name="+10% 参数变动" fill="#ef4444" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-amber-800 mb-1">分析结论</h4>
          <p className="text-sm text-amber-900 leading-relaxed">
            系统对 <span className="font-bold bg-amber-200 px-1 rounded">Q₁₀（温度敏感性）</span> 最敏感，
            这意味着未来气候变暖对土壤呼吸的激发效应是决定森林碳命运的关键。
            当 Q₁₀ 较高时，升温将导致土壤碳库快速释放，可能抵消光合作用增强带来的碳汇收益。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SensitivityAnalysis;