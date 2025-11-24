import { SimulationStep } from '../types';

/**
 * Converts simulation data to a CSV string with BOM for Excel compatibility
 */
export const generateCSV = (data: SimulationStep[]): string => {
  if (!data || data.length === 0) return '';

  // Define headers mapping
  const headers = {
    year: '年份',
    temp: '温度(°C)',
    precip: '降水(mm)',
    GPP: 'GPP(gC/m²)',
    NPP: 'NPP(gC/m²)',
    Ra: '自养呼吸Ra',
    Rh: '异养呼吸Rh',
    Litter: '凋落量Litter',
    Cveg: '植被碳库Cveg',
    Csoil: '土壤碳库Csoil',
    Catm_accumulated: '净大气通量NetFlux',
    fT: '温度因子fT',
    fW: '水分因子fW'
  };

  const keys = Object.keys(headers) as Array<keyof typeof headers>;
  const headerRow = keys.map(k => headers[k]).join(',');

  const rows = data.map(row => {
    return keys.map(k => {
      const val = row[k];
      return typeof val === 'number' ? val.toFixed(2) : val;
    }).join(',');
  });

  // Add BOM \uFEFF so Excel recognizes it as UTF-8
  return '\uFEFF' + [headerRow, ...rows].join('\n');
};

/**
 * Generates a Markdown table string, sampling data to keep it readable
 */
export const generateMarkdownTable = (data: SimulationStep[], interval: number = 5): string => {
  if (!data || data.length === 0) return '';

  const sampledData = data.filter((_, index) => index % interval === 0 || index === data.length - 1);

  const header = `| 年份 | 温度(°C) | GPP | NPP | Rh | 植被碳库 (Cveg) | 土壤碳库 (Csoil) | 净通量 (Net) |`;
  const separator = `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`;

  const rows = sampledData.map(row => {
    return `| ${row.year} | ${row.temp.toFixed(1)} | ${row.GPP.toFixed(0)} | ${row.NPP.toFixed(0)} | ${row.Rh.toFixed(0)} | ${row.Cveg.toFixed(0)} | ${row.Csoil.toFixed(0)} | ${row.Catm_accumulated.toFixed(0)} |`;
  }).join('\n');

  return `${header}\n${separator}\n${rows}`;
};