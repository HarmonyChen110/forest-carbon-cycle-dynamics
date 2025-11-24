
import React from 'react';
import { ModelParams } from '../types';
import { PARAMETER_PRESETS } from '../constants';
import { Settings, Sun, Thermometer, Zap } from 'lucide-react';

interface Props {
  params: ModelParams;
  setParams: React.Dispatch<React.SetStateAction<ModelParams>>;
}

const ControlPanel: React.FC<Props> = ({ params, setParams }) => {
  
  const handleChange = (key: keyof ModelParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetKey: string) => {
    const preset = PARAMETER_PRESETS[presetKey];
    if (preset) {
      setParams(preset.params);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100">
        <h3 className="text-xs font-bold text-indigo-800 flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3" /> 快速预设 (Quick Jump)
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(PARAMETER_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="text-xs text-left px-3 py-2 bg-white border border-indigo-200 rounded hover:bg-indigo-100 hover:border-indigo-300 transition-colors text-indigo-700"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4" /> 生理参数设定
        </h3>
        <div className="space-y-4">
          <Slider 
            label="温度敏感系数 (Q10)" 
            value={params.Q10} 
            min={1.0} max={3.5} step={0.1} 
            onChange={(v) => handleChange('Q10', v)} 
          />
          <Slider 
            label="最大光能利用率 (εmax)" 
            value={params.epsilonMax} 
            min={0.1} max={2.5} step={0.1} 
            onChange={(v) => handleChange('epsilonMax', v)} 
          />
          <Slider 
            label="自养呼吸系数 (α_ra)" 
            value={params.alphaRa} 
            min={0.2} max={0.8} step={0.05} 
            onChange={(v) => handleChange('alphaRa', v)} 
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Thermometer className="w-4 h-4" /> 气候变化情景
        </h3>
        <div className="space-y-4 bg-orange-50 p-3 rounded-md border border-orange-100">
          <Slider 
            label="升温速率 (°C/年)" 
            value={params.warmingRate} 
            min={-0.1} max={0.2} step={0.01} 
            onChange={(v) => handleChange('warmingRate', v)} 
          />
          <Slider 
            label="降水变化率 (%/年)" 
            value={params.precipChange} 
            min={-2} max={2} step={0.1} 
            onChange={(v) => handleChange('precipChange', v)} 
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Sun className="w-4 h-4" /> 人类活动影响
        </h3>
        <div className="space-y-4">
          <Slider 
            label="干扰强度系数 (h)" 
            value={params.h_human} 
            min={0} max={0.1} step={0.005} 
            onChange={(v) => handleChange('h_human', v)} 
          />
        </div>
      </div>
    </div>
  );
};

const Slider: React.FC<{
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (val: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
  <div>
    <div className="flex justify-between mb-1">
      <label className="text-xs text-slate-600 font-medium">{label}</label>
      <span className="text-xs text-slate-900 font-mono bg-slate-200 px-1 rounded">{value.toFixed(3)}</span>
    </div>
    <input 
      type="range" 
      min={min} max={max} step={step} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
    />
  </div>
);

export default ControlPanel;
