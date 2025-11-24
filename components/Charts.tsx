import React from 'react';
import { SimulationStep } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import ChartCard from './ChartCard';

interface Props {
  data: SimulationStep[];
}

const Charts: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-10 text-center text-slate-400">暂无模拟数据</div>;

  return (
    <div className="space-y-8">

      {/* Row 1: Stocks */}
      <ChartCard
        title="碳库动态(Carbon Stocks, MgC/ha)"
        explanation={
          <div>
            <p className="font-bold mb-1">图表解读：</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong className="text-emerald-600">绿色区域 (植被碳)</strong>: 代表树干、枝、叶、根中的碳储量。其增长主要来源于 NPP，减少来源于凋落 (Litter) 和人类干扰(H)。</li>
              <li><strong className="text-amber-700">棕色区域 (土壤碳)</strong>: 代表土壤有机碳(SOC) 和凋落物层。其来源是植被凋落，去向是异养呼吸(Rh)。</li>
              <li><strong>趋势含义</strong>: 若两者均呈上升趋势，说明生态系统正在积累碳；若出现下降，则表明干扰或呼吸损耗超过了输入。</li>
            </ul>
          </div>
        }
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCveg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCsoil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#854d0e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#854d0e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ fontSize: '12px' }} labelFormatter={(label) => `年份: ${label}`} />
              <Legend />
              <Area type="monotone" dataKey="Cveg" stackId="1" stroke="#10b981" fill="url(#colorCveg)" name="植被碳(Cveg)" />
              <Area type="monotone" dataKey="Csoil" stackId="1" stroke="#854d0e" fill="url(#colorCsoil)" name="土壤碳(Csoil)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Row 2: Fluxes & Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="碳通量 (Fluxes, gC/m²/yr)"
          explanation={
            <div className="space-y-1">
              <p>展示碳流动的速率。</p>
              <p>• <span className="text-emerald-600">GPP</span>: 光合作用总量。</p>
              <p>• <span className="text-emerald-500">NPP</span>: 净初级生产力(GPP - 自养呼吸)。它是生态系统碳输入的“天花板”。</p>
              <p>• <span className="text-orange-600">Rh</span>: 异养呼吸（土壤呼吸）。它是生态系统主要的碳“出口”。</p>
              <p className="mt-2 italic text-slate-500">注：当 Rh 大于 NPP 时，生态系统变为碳源。</p>
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ fontSize: '12px' }} labelFormatter={(label) => `年份: ${label}`} />
                <Legend />
                <Line type="monotone" dataKey="GPP" stroke="#059669" strokeWidth={2} dot={false} name="总初级生产力 (GPP)" />
                <Line type="monotone" dataKey="NPP" stroke="#10b981" strokeWidth={2} dot={false} name="净初级生产力(NPP)" />
                <Line type="monotone" dataKey="Rh" stroke="#ea580c" strokeWidth={2} dot={false} name="异养呼吸 (Rh)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="驱动因子与反馈(Drivers & Feedback)"
          explanation={
            <div>
              <p>环境因子对碳通量的限制作用(0-1)。</p>
              <ul className="list-disc pl-4 mt-1">
                <li><strong className="text-red-500">fT (温度因子)</strong>: 基于 Q10 曲线。温度升高通常会指数级增加呼吸消耗。</li>
                <li><strong className="text-blue-500">fW (水分因子)</strong>: 基于干旱指数。数值越低表示水分胁迫越严重，抑制光合作用。</li>
              </ul>
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" style={{ fontSize: '12px' }} domain={[0, 'auto']} />
                <YAxis yAxisId="right" orientation="right" style={{ fontSize: '12px' }} domain={['auto', 'auto']} unit="°C" />
                <Tooltip contentStyle={{ fontSize: '12px' }} labelFormatter={(label) => `年份: ${label}`} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="fT" stroke="#dc2626" dot={false} name="温度因子 (fT)" />
                <Line yAxisId="left" type="monotone" dataKey="fW" stroke="#3b82f6" dot={false} name="水分因子 (fW)" />
                <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="温度 (°C)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Net Balance */}
      <ChartCard
        title="生态系统净碳平衡(累计, gC/m²)"
        explanation={
          <div className="space-y-2">
            <p>该图显示了自模拟开始以来，生态系统与大气之间<strong>累计净交换量(Net Ecosystem Exchange)</strong>。</p>
            <div className="flex items-start gap-2 mt-2">
              <div className="w-4 h-4 bg-red-500/50 border border-red-500 rounded shrink-0 mt-1"></div>
              <div>
                <strong className="text-red-700">红色区域 (Positive / Source)</strong>
                <p>代表<strong>净排放</strong>。生态系统释放的碳多于吸收的碳（Respiration &gt; GPP），加剧了温室效应。</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-emerald-500/50 border border-emerald-500 rounded shrink-0 mt-1"></div>
              <div>
                <strong className="text-emerald-700">绿色区域 (Negative / Sink)</strong>
                <p>代表<strong>净吸收</strong>。生态系统从大气中固定的碳多于释放的碳，起到了碳汇的作用。</p>
              </div>
            </div>
          </div>
        }
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ fontSize: '12px' }} labelFormatter={(label) => `年份: ${label}`} />
              <Legend />
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="1" stopColor="#10b981" stopOpacity={0.6} />
                </linearGradient>
                {/* Note: A true visual split at y=0 requires a calculated offset based on data min/max. 
                    For simplicity here, we rely on standard gradient, or we can imply color by value sign in tooltip.
                    A better approach for Recharts split is complex, so we use a solid recognizable color line or generic gradient 
                    and rely on the explanation text. 
                    Let's make a gradient that transitions roughly where 0 might be if normalized, 
                    but since scale changes, a single gradient isn't perfect. 
                    Instead, we will color based on the value logic in a custom dot or just stick to a neutral fill with explanations.
                    Actually, let's keep the user-requested semantic coloring conceptual:
                */}
                <linearGradient id="netBalanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              {/* 
                 Visual Trick: If the value is positive (Source), it tends to be drawn upwards (Red). 
                 If negative (Sink), downwards (Green). 
                 However, Area charts fill from 0. 
                 Correct interpretation: y > 0 is Red, y < 0 is Green.
              */}
              <Area
                type="monotone"
                dataKey="Catm_accumulated"
                stroke="#475569"
                fill="url(#netBalanceGradient)"
                name="净大气通量 (累计)"
              />
              {/* Reference Line at 0 */}
              <Line type="monotone" dataKey={() => 0} stroke="#000" strokeWidth={1} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

    </div>
  );
};

export default Charts;
