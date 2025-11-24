
import { SiteData } from '../types';

export const parseData = (text: string): SiteData[] => {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 1) return [];

  // 1. Intelligent Header Detection
  // Look for a line that contains typical column names
  let headerIndex = 0;
  let separator = '\t';
  const validSeparators = ['\t', ',', ';'];
  
  const keywords = ['site', 'lon', 'lat', 'habitat', 'npp', 'mat', 'map'];
  
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const lineLower = lines[i].toLowerCase();
    // Try to detect separator based on count
    let maxCols = 0;
    let bestSep = '\t';
    
    for (const sep of validSeparators) {
      const cols = lineLower.split(sep);
      if (cols.length > maxCols) {
        maxCols = cols.length;
        bestSep = sep;
      }
    }

    // Check if this line has enough keywords to be a header
    const matchCount = keywords.reduce((acc, key) => acc + (lineLower.includes(key) ? 1 : 0), 0);
    
    if (matchCount >= 3) { // Arbitrary threshold: at least 3 keywords match
      headerIndex = i;
      separator = bestSep;
      break;
    }
  }

  const headers = lines[headerIndex].split(separator).map(h => h.trim().replace(/^"|"$/g, '')); // Remove quotes if CSV
  
  // Helper to find column index case-insensitively
  const getIdx = (key: string) => headers.findIndex(h => h.toLowerCase() === key.toLowerCase());

  // Mapping Logic
  const idx = {
    Site: getIdx('Site'),
    Lon: getIdx('Lon'),
    Lat: getIdx('Lat'),
    Habitat: getIdx('Habitat'),
    MAT: -1,
    MAP: -1,
    SOC: -1,
    NPP: -1,
    GPP: -1,
    AridityIndex: -1,
    HMI: getIdx('HMI'),
    Elevation: getIdx('Elevation'),
    SoilC_mean: getIdx('SoilC_mean'),
  };

  // Handle variations in column names based on the provided dataset
  if (idx.MAT === -1) idx.MAT = getIdx('MAT');
  if (idx.MAP === -1) idx.MAP = getIdx('MAP');
  if (idx.SOC === -1) idx.SOC = getIdx('SOC');
  
  // NPP priority
  if (idx.NPP === -1) idx.NPP = getIdx('NPP_total_withLitter'); 
  if (idx.NPP === -1) idx.NPP = getIdx('MOD17_NPP');
  if (idx.NPP === -1) idx.NPP = getIdx('NPP_mean');

  // GPP priority
  if (idx.GPP === -1) idx.GPP = getIdx('MOD17_GPP');
  if (idx.GPP === -1) idx.GPP = getIdx('GPP');

  if (idx.AridityIndex === -1) idx.AridityIndex = getIdx('AridityIndex');
  if (idx.AridityIndex === -1) idx.AridityIndex = getIdx('AI');

  // HMI fallback
  if (idx.HMI === -1) idx.HMI = getIdx('gHM');

  const data: SiteData[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    // Handle potential CSV quoting issues simply by splitting (robust CSV parsing would require a library, but this suffices for standard outputs)
    const cols = lines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
    
    if (cols.length < 2) continue; // Skip empty lines

    // Extract numeric values safely
    const num = (index: number, def: number = 0) => {
        if (index === -1 || index >= cols.length) return def;
        const val = parseFloat(cols[index]);
        return isNaN(val) ? def : val;
    };

    const str = (index: number, def: string = "") => {
        if (index === -1 || index >= cols.length) return def;
        return cols[index]?.trim() || def;
    };

    const nppVal = num(idx.NPP);
    // Filter invalid rows lightly
    if (nppVal <= 0 && idx.NPP !== -1) continue; 

    const item: SiteData = {
      Site: str(idx.Site, `Site-${i}`),
      Lon: num(idx.Lon),
      Lat: num(idx.Lat),
      Habitat: str(idx.Habitat, 'F'),
      MAT: num(idx.MAT, 15), 
      MAP: num(idx.MAP, 1000),
      SOC: num(idx.SOC, 50), 
      NPP: nppVal > 0 ? nppVal : 500, // Fallback if missing
      GPP: num(idx.GPP, (nppVal > 0 ? nppVal : 500) * 2.2), // Approximation: GPP ~ 2.2 * NPP
      Cveg_initial: (nppVal > 0 ? nppVal : 500) * 10, // Rough approximation
      AridityIndex: num(idx.AridityIndex, 1.0),
      HMI: num(idx.HMI, 0),
      Elevation: num(idx.Elevation, 0),
      SoilC_mean: num(idx.SoilC_mean, 0) 
    };

    // Heuristic fix for Soil Carbon if SoilC_mean is missing but SOC is present
    if (item.SoilC_mean === 0 && item.SOC > 0) {
        // Assume SOC is g/kg or similar, scale to Mg/ha roughly for visualization if no other info
        // Or just use SOC as the proxy
        item.SoilC_mean = item.SOC; 
    }

    data.push(item);
  }

  return data;
};
