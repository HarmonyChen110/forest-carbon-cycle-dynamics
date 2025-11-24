import { ModelParams } from './types';

export const DEFAULT_PARAMS: ModelParams = {
  epsilonMax: 1.1, // g C MJ^-1 PAR
  Q10: 2.0,
  alphaRa: 0.53, // NPP approx 0.47 * GPP, so Ra is approx 0.53
  kLit: 0.15, // Turnover rate
  kSoil: 0.03, // Slow turnover for soil
  h_human: 0.01, // Base human impact scalar
  warmingRate: 0.0, // 0 degrees per year baseline
  precipChange: 0.0, // 0% change baseline
};

export const PARAMETER_PRESETS: Record<string, { label: string; params: ModelParams }> = {
  CLASSIC: {
    label: "初稿设定 (经典文献值)",
    params: DEFAULT_PARAMS
  },
  HIGH_WARMING: {
    label: "高排放情景 (RCP 8.5)",
    params: {
      ...DEFAULT_PARAMS,
      warmingRate: 0.08, // ~4 degrees in 50 years
      Q10: 2.2, // Slightly higher sensitivity
      precipChange: -0.5 // Drying trend
    }
  },
  HIGH_DISTURBANCE: {
    label: "强人为干扰 (砍伐/退化)",
    params: {
      ...DEFAULT_PARAMS,
      h_human: 0.08, // High extraction rate
      epsilonMax: 0.9 // Degraded efficiency
    }
  }
};

// A subset of the provided raw text data to allow immediate functionality
export const SAMPLE_RAW_DATA = `Site	Lon	Lat	Year_start	Habitat	NPP_total_withLitter	SoilC_mean	MAT	MAP	AridityIndex	HMI	MOD17_GPP	MOD17_NPP	SOC
AR-ach-D01	31.6	64.8	1994	G	946	6.6	9.65	667	0.4061	0.1787	0.088	0.0537	2.644
AU-tum-D01	35.66	148.17	2001	F	2564.97	6.3	8.92	1454	1.194	0.0781	0.8127	0.5066	1.639
BE-Bra-F01	51.31	4.52	2000	F	1810.5	6.3	10.35	809	0.9488	0.0585	0.1504	0.0894	0.628
BR-BdP-D01	16.498	56.413	2011	F	1800	6.3	25.24	1318	0.871	0.3201	2.7705	1.3734	0.578
BR-sa1-D01	-54.5	-3.0	2002	F	2200	4.5	26.0	2000	0.95	0.15	3.1	1.5	3.2
CA-Obs-F01	53.92	104.68	2003	F	1750	6.3	-0.08	471	0.5658	0.3271	0.9692	0.6019	3.07
CN-He1-D01	22.34	112.5	2007	F	1874.5	6.3	22.18	1945	1.4667	0.2232	6.5534	0.5185	1.209
DE-Hai-F01	51.08	10.45	2000	F	1710.5	6.3	7.49	870	1.0923	0.9219	1.3521	0.9307	7.1
FR-Hes-F01	48.67	7.07	2000	F	2253	6.3	9.21	800	0.9121	0.1154	2.4212	1.2584	1.562
IT-Col-F01	41.85	13.59	1996	F	1655.48	6.3	6.95	789	0.7569	0.3499	2.0477	1.1421	1.562
US-Ha1-F01	42.53	72.17	1999	F	1312	6.3	7.00	1102	1.0976	0.1661	0.1561	0.1102	3.46
US-MMS-F01	39.32	86.42	1999	F	1960	6.3	11.12	1097	0.9318	0.5497	0.6714	0.4088	1.456
`;