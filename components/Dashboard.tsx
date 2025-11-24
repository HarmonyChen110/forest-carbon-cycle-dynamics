import React, { useState, useEffect, useMemo } from 'react';
import { SiteData, ModelParams, SimulationStep, SensitivityResult } from '../types';
import { parseData } from '../services/dataService';
import { runSimulation, runSensitivityAnalysis } from '../services/modelService';
import { SAMPLE_RAW_DATA, DEFAULT_PARAMS } from '../constants';
import Charts from './Charts';
import ControlPanel from './ControlPanel';
import StockFlowDiagram from './StockFlowDiagram';
import SensitivityAnalysis from './SensitivityAnalysis';
import SimulationReport from './SimulationReport';
import { Map, Database, Activity, TrendingUp, AlertCircle, BookOpen, X, GitMerge, BarChart2, FileText } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [rawText, setRawText] = useState(SAMPLE_RAW_DATA);
  const [sites, setSites] = useState<SiteData[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [params, setParams] = useState<ModelParams>(DEFAULT_PARAMS);
  const [simulationData, setSimulationData] = useState<SimulationStep[]>([]);
  const [sensitivityData, setSensitivityData] = useState<SensitivityResult[]>([]);
  const [activeTab, setActiveTab] = useState<'charts' | 'structure' | 'sensitivity' | 'report' | 'data'>('charts');
  const [showReadme, setShowReadme] = useState(false);

  // Parse data on load
  useEffect(() => {
    const parsed = parseData(rawText);
    setSites(parsed);
    if (parsed.length > 0 && !selectedSiteId) {
      setSelectedSiteId(parsed[0].Site);
    }
  }, [rawText, selectedSiteId]);

  const selectedSite = useMemo(() => 
    sites.find(s => s.Site === selectedSiteId) || sites[0]
  , [sites, selectedSiteId]);

  // Run simulation whenever dependencies change
  useEffect(() => {
    if (selectedSite) {
      // Main Simulation
      const results = runSimulation(selectedSite, params);
      setSimulationData(results);

      // Sensitivity Analysis
      const sensResults = runSensitivityAnalysis(selectedSite, params);
      setSensitivityData(sensResults);
    }
  }, [selectedSite, params]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setRawText(evt.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar / Controls */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-screen overflow-y-auto shadow-lg z-10 shrink-0">
        <div className="p-6 border-b border-slate-100 bg-emerald-900 text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            森林碳循环
          </h1>
          <p className="text-xs text-emerald-200 mt-1">System Dynamics Model</p>
        </div>

        <div className="p-4 space-y-6">
          
          {/* Site Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Map className="w-4 h-4" /> 选择研究站点
            </label>
            <select 
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {sites.map(s => (
                <option key={s.Site} value={s.Site}>
                  {s.Site} ({s.Habitat === 'F' ? '森林' : s.Habitat === 'G' ? '草地' : s.Habitat})
                </option>
              ))}
            </select>
            
            {selectedSite && (
              <div className="mt-4 bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between"><span>年均温 (MAT):</span> <span className="font-medium">{selectedSite.MAT.toFixed(1)}°C</span></div>
                <div className="flex justify-between"><span>年降雨 (MAP):</span> <span className="font-medium">{selectedSite.MAP.toFixed(0)}mm</span></div>
                <div className="flex justify-between"><span>NPP (观测值):</span> <span className="font-medium">{selectedSite.NPP.toFixed(0)}</span></div>
                <div className="flex justify-between"><span>人类干扰 (HMI):</span> <span className="font-medium">{selectedSite.HMI.toFixed(2)}</span></div>
              </div>
            )}
          </div>

          {/* Parameters Control */}
          <ControlPanel params={params} setParams={setParams} />

          {/* Data Upload */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" /> 加载完整数据集
            </label>
            <input 
              type="file" 
              accept=".txt,.csv,.tsv"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-xs file:font-semibold
                file:bg-emerald-50 file:text-emerald-700
                hover:file:bg-emerald-100
              "
            />
            <p className="text-[10px] text-slate-400 mt-1">支持格式: CSV (逗号分隔) 或 TXT (制表符分隔)</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Navigation */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex space-x-2">
            <NavButton active={activeTab === 'charts'} onClick={() => setActiveTab('charts')} icon={TrendingUp}>模拟结果</NavButton>
            <NavButton active={activeTab === 'structure'} onClick={() => setActiveTab('structure')} icon={GitMerge}>系统结构</NavButton>
            <NavButton active={activeTab === 'sensitivity'} onClick={() => setActiveTab('sensitivity')} icon={BarChart2}>敏感性分析</NavButton>
            <NavButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon={FileText}>智能评估报告</NavButton>
            <NavButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={Database}>原始数据</NavButton>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
             <button 
              onClick={() => setShowReadme(true)}
              className="text-slate-500 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" /> 模型说明
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          {activeTab === 'charts' && (
            <div className="max-w-6xl mx-auto space-y-6">
               {/* Key Metrics Summary */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard title="平均 NPP" value={simulationData.reduce((a,b)=>a+b.NPP,0)/simulationData.length} unit="gC/m²/yr" />
                  <MetricCard title="期末土壤碳储量" value={simulationData[simulationData.length-1]?.Csoil} unit="gC/m²" />
                  <MetricCard title="期末植被碳储量" value={simulationData[simulationData.length-1]?.Cveg} unit="gC/m²" />
                  <MetricCard title="净大气通量 (累计)" value={simulationData[simulationData.length-1]?.Catm_accumulated} unit="gC/m²" positiveBad={true} />
               </div>

               <Charts data={simulationData} />
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="h-full flex items-center justify-center">
              <StockFlowDiagram />
            </div>
          )}

          {activeTab === 'sensitivity' && (
            <div className="max-w-4xl mx-auto h-full">
              <SensitivityAnalysis data={sensitivityData} />
            </div>
          )}

          {activeTab === 'report' && selectedSite && (
            <SimulationReport 
              site={selectedSite} 
              params={params} 
              simData={simulationData} 
              sensData={sensitivityData} 
            />
          )}

          {activeTab === 'data' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(sites[0] || {}).map(k => (
                        <th key={k} className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {sites.slice(0, 100).map((site, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {Object.values(site).map((val, j) => (
                          <td key={j} className="px-4 py-2 whitespace-nowrap text-slate-700">
                            {typeof val === 'number' ? val.toFixed(2) : val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-200">
                仅显示前 100 行数据。总站点数: {sites.length}
              </div>
            </div>
          )}
        </div>

        {/* README Modal */}
        {showReadme && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
              <button 
                onClick={() => setShowReadme(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="p-8 prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold text-emerald-800 mb-4">森林碳循环系统动力学模型说明</h2>
                
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Activity className="w-5 h-5" /> 模型背景
                    </h3>
                    <p className="text-sm text-slate-600">
                      本模型基于系统动力学 (System Dynamics) 方法构建，旨在模拟森林生态系统在气候变化（温度、降水）与人类活动双重影响下的碳收支动态。
                      模型超越了简单的静态统计回归，重点关注系统内部“植物—土壤—大气”三个碳库之间的流动机制与非线性反馈（如 <span className="font-mono">Q₁₀</span> 效应、水分胁迫）。
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <GitMerge className="w-5 h-5" /> 核心动力学方程
                    </h3>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-xs space-y-3 shadow-sm">
                      <div>
                        <strong className="text-emerald-700">1. 碳输入 (GPP & NPP)</strong>
                        <div className="pl-4 mt-1 text-slate-600">
                          GPP = εmax × APAR × f(T) × f(W)<br/>
                          NPP = GPP - Ra (自养呼吸)
                        </div>
                      </div>
                      <div>
                        <strong className="text-emerald-700">2. 碳库状态方程 (Differential Equations)</strong>
                        <div className="pl-4 mt-1 text-slate-600">
                          dCveg/dt = NPP - Litter - H (人类干扰)<br/>
                          dCsoil/dt = Litter - Rh (异养呼吸)<br/>
                          dCatm/dt = Ra + Rh - GPP
                        </div>
                      </div>
                      <div>
                        <strong className="text-emerald-700">3. 关键反馈机制</strong>
                        <ul className="list-disc pl-8 mt-1 text-slate-600">
                          <li>f(T): 基于 Arrhenius 或 Q₁₀ 的指数增长函数，由 <span className="font-bold">Q₁₀</span> 参数控制。</li>
                          <li>f(W): 基于 Aridity Index 的饱和曲线函数。</li>
                          <li>H: 人类干扰 (HMI) 造成的直接生物量移除，模拟砍伐或退化。</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Database className="w-5 h-5" /> 数据输入规范
                    </h3>
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-sm text-amber-900">
                      <p className="font-bold mb-2">为确保模型正确初始化，上传的数据文件（CSV 或 TXT）必须包含以下表头（不区分大小写）：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><code>Site</code>: 唯一站点标识符 (String)</li>
                        <li><code>Lat</code>, <code>Lon</code>: 纬度和经度 (Decimal)</li>
                        <li><code>MAT</code>: 年均温 (°C) —— 驱动温度反馈</li>
                        <li><code>MAP</code>: 年降水量 (mm) —— 驱动水分反馈</li>
                        <li><code>NPP</code> (或 <code>MOD17_NPP</code>): 净初级生产力 (gC/m²/yr) —— 初始化通量</li>
                        <li><code>SOC</code> (或 <code>SoilC_mean</code>): 土壤有机碳 (MgC/ha 或 g/kg) —— 初始化土壤碳库</li>
                        <li><code>HMI</code> (或 <code>gHM</code>): 人类干扰指数 (0-1) —— 驱动干扰流 H</li>
                      </ul>
                      <p className="mt-2 text-xs text-amber-700">注：系统会自动尝试识别分隔符（逗号或制表符），并智能匹配相近的列名。</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" /> 使用指南
                    </h3>
                    <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-2">
                      <li>在左侧面板选择预置的“研究站点”，观察其初始气候与碳状态。</li>
                      <li>点击顶部 <span className="font-bold text-slate-800">“系统结构”</span> 标签，理解模型的流转逻辑。</li>
                      <li>调整 <span className="font-bold text-slate-800">“敏感性分析”</span> 标签，查看 Tornado 图，验证 <span className="font-mono">Q₁₀</span> 是否为最关键参数。</li>
                      <li>点击 <span className="font-bold text-slate-800">“智能评估报告”</span> 下载结构化文档。</li>
                    </ol>
                  </section>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => setShowReadme(false)}
                    className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
                  >
                    开始模拟
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: any, children: React.ReactNode}> = ({active, onClick, icon: Icon, children}) => (
  <button 
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center whitespace-nowrap ${active ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
  >
    <Icon className="w-4 h-4 mr-2" /> {children}
  </button>
);

const MetricCard: React.FC<{title: string, value: number, unit: string, positiveBad?: boolean}> = ({title, value, unit, positiveBad}) => {
  const val = value || 0;
  const isPositive = val > 0;
  const colorClass = positiveBad 
    ? (isPositive ? 'text-red-600' : 'text-emerald-600') 
    : 'text-slate-900';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      <div className={`text-xl sm:text-2xl font-bold mt-1 ${colorClass}`}>
        {val.toLocaleString(undefined, {maximumFractionDigits: 1})}
      </div>
      <div className="text-[10px] sm:text-xs text-slate-400">{unit}</div>
    </div>
  );
};

export default Dashboard;