export interface SiteData {
  Site: string;
  Lon: number;
  Lat: number;
  Habitat: string; // F = Forest, G = Grassland
  MAT: number; // Mean Annual Temperature
  MAP: number; // Mean Annual Precipitation
  SOC: number; // Soil Organic Carbon
  NPP: number; // Net Primary Production (observed or derived)
  GPP: number; // Gross Primary Production
  Cveg_initial: number; // Initial Vegetation Carbon
  AridityIndex: number;
  HMI: number; // Human Modification Index (GHM)
  Elevation: number;
  SoilC_mean: number; // Used for Soil Carbon initialization
}

export interface ModelParams {
  epsilonMax: number; // Max light use efficiency
  Q10: number; // Temperature sensitivity
  alphaRa: number; // Autotrophic respiration coefficient
  kLit: number; // Litterfall rate constant
  kSoil: number; // Soil decomposition rate constant
  h_human: number; // Human disturbance coefficient
  warmingRate: number; // Degrees C per year (simulation scenario)
  precipChange: number; // Percent change per year (simulation scenario)
}

export interface SimulationStep {
  year: number;
  temp: number; // Driven Temperature
  precip: number; // Driven Precipitation
  GPP: number;
  NPP: number;
  Ra: number; // Plant Respiration
  Rh: number; // Soil Respiration
  Litter: number;
  Cveg: number; // Vegetation Carbon Stock
  Csoil: number; // Soil Carbon Stock
  Catm_accumulated: number; // Net exchange to atmosphere relative to t0
  fT: number; // Temperature feedback factor
  fW: number; // Water feedback factor
}

export interface SensitivityResult {
  parameter: string;
  label: string;
  baseline: number;
  low: number; // Result with -10% param
  high: number; // Result with +10% param
  changeLow: number; // % change
  changeHigh: number; // % change
}

export enum SimulationScenario {
  BASELINE = 'BASELINE',
  WARMING = 'WARMING',
  DRYING = 'DRYING',
  HIGH_DISTURBANCE = 'HIGH_DISTURBANCE'
}