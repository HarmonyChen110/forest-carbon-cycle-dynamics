import { SiteData, ModelParams, SimulationStep, SensitivityResult } from '../types';

// Temperature Sensitivity Function (Q10)
// T_ref is set to 10 degrees C based on common ecological models
const calc_fT = (Temp: number, Q10: number, T_ref: number = 10): number => {
  return Math.pow(Q10, (Temp - T_ref) / 10.0);
};

// Water Stress Function (Based on Aridity Index)
// Assumes AI_opt is around 1.5 (humid), decreasing linearly below that
const calc_fW = (AI: number, AI_opt: number = 1.5): number => {
  return Math.min(1.0, Math.max(0.1, AI / AI_opt));
};

// Soil Water Stress (Simplified bell curve or saturation function)
// For this simplified model, we reuse the AI scaling as a proxy for soil moisture availability
const calc_fW_soil = (AI: number): number => {
    // Decomposition is inhibited by very dry conditions AND very wet (anaerobic)
    // Simplified here to follow general moisture availability
    return Math.min(1.0, Math.max(0.05, AI)); 
};

export const runSimulation = (
  site: SiteData, 
  params: ModelParams, 
  years: number = 50
): SimulationStep[] => {
  const results: SimulationStep[] = [];

  // Initial Stocks
  let Cveg = site.Cveg_initial; 
  // If SoilC_mean is available (MgC/ha), use it. Otherwise approximate.
  let Csoil = site.SoilC_mean > 0 ? site.SoilC_mean * 10 : site.SOC * 20; // Heuristic conversion if units unclear
  let Catm_accumulated = 0;

  // Drivers initialization
  let currentTemp = site.MAT;
  let currentPrecip = site.MAP; // Used to update AI
  let currentAI = site.AridityIndex;

  // APAR approximation (Absorbed Photosynthetically Active Radiation)
  // We use GPP_initial / epsilon_max to back-calculate effective APAR at t=0
  // This assumes the site's reported GPP is the baseline capacity
  const initial_fT = calc_fT(site.MAT, params.Q10);
  const initial_fW = calc_fW(site.AridityIndex);
  
  // Effective APAR baseline derived from site data to ensure model starts near observed reality
  const baseline_APAR = site.GPP > 0 
    ? site.GPP / (params.epsilonMax * initial_fT * initial_fW) 
    : 1000; // Default fallback

  for (let t = 0; t <= years; t++) {
    // 1. Update Drivers (Climate Change Scenarios)
    currentTemp = site.MAT + (params.warmingRate * t);
    const precipModifier = 1 + ((params.precipChange / 100) * t);
    currentPrecip = site.MAP * precipModifier;
    
    // Approximation: AI changes proportional to Precip/Temp (simplified PET relationship)
    // PET increases with Temp (approx 2% per degree C is a rule of thumb)
    const petModifier = 1 + 0.02 * (currentTemp - site.MAT); 
    currentAI = site.AridityIndex * (precipModifier / petModifier);

    // 2. Calculate Regulatory Factors
    const fT = calc_fT(currentTemp, params.Q10);
    const fW = calc_fW(currentAI);
    const fT_soil = calc_fT(currentTemp, params.Q10); // Often Soil Q10 is different, but using same for parsimony here
    const fW_soil = calc_fW_soil(currentAI);

    // 3. Human Disturbance Factor (GHM)
    // HMI (0-1) acts as a reducer of vegetation biomass (logging, degradation)
    // Modeled as a fractional loss rate
    const disturbanceRate = params.h_human * site.HMI; 

    // 4. Calculate Flows
    // GPP = eMax * APAR * fT * fW
    // We apply a logistic capacity constraint implicitly by using biomass feedback if we wanted complex growth,
    // but standard SD uses flux-driven.
    const GPP = params.epsilonMax * baseline_APAR * fT * fW;

    // Ra (Plant Respiration)
    // Increases with temperature (Q10) and biomass, but here using standard fraction of GPP 
    // adjusted by Q10 to decouple slightly from GPP for dynamic response
    const Ra = params.alphaRa * GPP * Math.pow(1.05, (currentTemp - site.MAT)); // Slight extra resp penalty for heat

    const NPP = Math.max(0, GPP - Ra);

    // Litterfall
    const Litter = params.kLit * Cveg;

    // Rh (Heterotrophic Respiration / Decomposition)
    const Rh = params.kSoil * Csoil * fT_soil * fW_soil;

    // Human Extraction (H)
    const H = disturbanceRate * Cveg;

    // 5. Update Stocks (Euler Integration, dt=1 year)
    const dCveg = NPP - Litter - H;
    const dCsoil = Litter - Rh;
    const dCatm = Ra + Rh - GPP; // Net flux from ecosystem to atmosphere

    Cveg += dCveg;
    Csoil += dCsoil;
    Catm_accumulated += dCatm;

    // Prevent negative stocks
    Cveg = Math.max(0, Cveg);
    Csoil = Math.max(0, Csoil);

    results.push({
      year: 2000 + t,
      temp: currentTemp,
      precip: currentPrecip,
      GPP,
      NPP,
      Ra,
      Rh,
      Litter,
      Cveg,
      Csoil,
      Catm_accumulated,
      fT,
      fW
    });
  }

  return results;
};

export const runSensitivityAnalysis = (
  site: SiteData,
  baselineParams: ModelParams
): SensitivityResult[] => {
  // Parameters to test
  const paramsToTest: { key: keyof ModelParams; label: string }[] = [
    { key: 'Q10', label: 'Q10 (温度敏感性)' },
    { key: 'epsilonMax', label: 'εmax (光能利用率)' },
    { key: 'h_human', label: 'h (人类干扰系数)' },
    { key: 'kSoil', label: 'kSoil (土壤分解率)' },
  ];

  // Baseline Run
  const baselineSim = runSimulation(site, baselineParams);
  const baselineStorage = baselineSim[baselineSim.length - 1].Cveg + baselineSim[baselineSim.length - 1].Csoil;

  const results: SensitivityResult[] = paramsToTest.map(p => {
    const delta = 0.1; // +/- 10% perturbation

    // Low Run (-10%)
    const lowParams = { ...baselineParams };
    // Special handling for human factor which can be 0
    if (p.key === 'h_human') {
       lowParams[p.key] = Math.max(0, baselineParams[p.key] - 0.005); // Absolute shift for small fraction
    } else {
       lowParams[p.key] = baselineParams[p.key] * (1 - delta);
    }
    const lowSim = runSimulation(site, lowParams);
    const lowStorage = lowSim[lowSim.length - 1].Cveg + lowSim[lowSim.length - 1].Csoil;

    // High Run (+10%)
    const highParams = { ...baselineParams };
    if (p.key === 'h_human') {
       highParams[p.key] = baselineParams[p.key] + 0.005;
    } else {
       highParams[p.key] = baselineParams[p.key] * (1 + delta);
    }
    const highSim = runSimulation(site, highParams);
    const highStorage = highSim[highSim.length - 1].Cveg + highSim[highSim.length - 1].Csoil;

    return {
      parameter: p.key,
      label: p.label,
      baseline: baselineStorage,
      low: lowStorage,
      high: highStorage,
      changeLow: ((lowStorage - baselineStorage) / baselineStorage) * 100,
      changeHigh: ((highStorage - baselineStorage) / baselineStorage) * 100
    };
  });

  return results;
};