/**
 * Centralized configuration map of Indian State Codes to their correct
 * Regional Load Despatch Centre (RLDC) and State Load Despatch Centre (SLDC) scraping API endpoints.
 * This facilitates dynamic scaling and real-time ledger scraping for the GridScraperOrchestrator.
 */

export interface RLDCConfig {
  code: string;
  name: string;
  apiEndpoint: string;
}

export interface SLDCConfig {
  stateCode: string;
  stateName: string;
  rldcCode: "NRLDC" | "WRLDC" | "SRLDC" | "ERLDC" | "NERLDC";
  sldcApiEndpoint: string;
  backupSldcApiEndpoint: string;
  baseCapacityMw: number;
}

/**
 * Endpoint registry for the 5 Regional Load Despatch Centres (RLDC) of India.
 * Managed by Power System Operation Corporation (POSOCO) / Grid Controller of India.
 */
export const RLDC_ENDPOINTS: Record<string, RLDCConfig> = {
  NRLDC: {
    code: "NRLDC",
    name: "Northern Regional Load Despatch Centre (New Delhi)",
    apiEndpoint: "https://nrldc.in/api/v1/grid-state/realtime"
  },
  WRLDC: {
    code: "WRLDC",
    name: "Western Regional Load Despatch Centre (Mumbai)",
    apiEndpoint: "https://wrldc.in/api/v1/grid-state/realtime"
  },
  SRLDC: {
    code: "SRLDC",
    name: "Southern Regional Load Despatch Centre (Bengaluru)",
    apiEndpoint: "https://srldc.in/api/v1/grid-state/realtime"
  },
  ERLDC: {
    code: "ERLDC",
    name: "Eastern Regional Load Despatch Centre (Kolkata)",
    apiEndpoint: "https://erldc.in/api/v1/grid-state/realtime"
  },
  NERLDC: {
    code: "NERLDC",
    name: "North Eastern Regional Load Despatch Centre (Shillong)",
    apiEndpoint: "https://nerldc.org/api/v1/grid-state/realtime"
  }
};

/**
 * State-by-State State Load Despatch Centre (SLDC) registry.
 * Maps all 30 Indian state codes to their dedicated operational endpoints.
 */
export const STATE_SLDC_REGISTRY: Record<string, SLDCConfig> = {
  MH: {
    stateCode: "MH",
    stateName: "Maharashtra",
    rldcCode: "WRLDC",
    sldcApiEndpoint: "https://mahasldc.in/api/v1/state-load/live",
    backupSldcApiEndpoint: "https://backup-api.mahasldc.in/v1/load",
    baseCapacityMw: 26500
  },
  DL: {
    stateCode: "DL",
    stateName: "Delhi",
    rldcCode: "NRLDC",
    sldcApiEndpoint: "https://delhisldc.org/api/v1/demand/realtime",
    backupSldcApiEndpoint: "https://backup.delhisldc.org/api/demand",
    baseCapacityMw: 7400
  },
  KA: {
    stateCode: "KA",
    stateName: "Karnataka",
    rldcCode: "SRLDC",
    sldcApiEndpoint: "https://kptclsldc.in/api/v1/grid-flow/reading",
    backupSldcApiEndpoint: "https://backup.kptclsldc.in/api/v1/reading",
    baseCapacityMw: 13500
  },
  GJ: {
    stateCode: "GJ",
    stateName: "Gujarat",
    rldcCode: "WRLDC",
    sldcApiEndpoint: "https://sldcgujarat.com/api/v1/realtime/grid-status",
    backupSldcApiEndpoint: "https://backup.sldcgujarat.com/api/v1/status",
    baseCapacityMw: 19500
  },
  TN: {
    stateCode: "TN",
    stateName: "Tamil Nadu",
    rldcCode: "SRLDC",
    sldcApiEndpoint: "http://tnsldc.org/api/v1/generation-demand/live",
    backupSldcApiEndpoint: "http://backup.tnsldc.org/api/v1/live",
    baseCapacityMw: 17200
  },
  UP: {
    stateCode: "UP",
    stateName: "Uttar Pradesh",
    rldcCode: "NRLDC",
    sldcApiEndpoint: "https://upsldc.org/api/v1/load-data/frequency",
    backupSldcApiEndpoint: "https://backup.upsldc.org/api/load-data",
    baseCapacityMw: 24500
  },
  WB: {
    stateCode: "WB",
    stateName: "West Bengal",
    rldcCode: "ERLDC",
    sldcApiEndpoint: "https://wbsldc.in/api/v1/live-generation/data",
    backupSldcApiEndpoint: "https://backup.wbsldc.in/api/v1/data",
    baseCapacityMw: 9100
  },
  AP: {
    stateCode: "AP",
    stateName: "Andhra Pradesh",
    rldcCode: "SRLDC",
    sldcApiEndpoint: "https://apsldc.aptransco.co.in/api/v1/demand/live-flow",
    backupSldcApiEndpoint: "https://backup.apsldc.aptransco.co.in/api/v1/demand",
    baseCapacityMw: 9500
  },
  TS: {
    stateCode: "TS",
    stateName: "Telangana",
    rldcCode: "SRLDC",
    sldcApiEndpoint: "https://tstransco.in/sldc/api/v1/loads/live-telemetry",
    backupSldcApiEndpoint: "https://backup.tstransco.in/sldc/api/loads",
    baseCapacityMw: 14800
  },
  KL: {
    stateCode: "KL",
    stateName: "Kerala",
    rldcCode: "SRLDC",
    sldcApiEndpoint: "https://keralasldc.org/api/v1/power-status/realtime",
    backupSldcApiEndpoint: "https://backup.keralasldc.org/api/power-status",
    baseCapacityMw: 4100
  },
  MP: {
    stateCode: "MP",
    stateName: "Madhya Pradesh",
    rldcCode: "WRLDC",
    sldcApiEndpoint: "https://mpsldc.org/api/v1/current-demand/scada",
    backupSldcApiEndpoint: "https://backup.mpsldc.org/api/v1/scada",
    baseCapacityMw: 14500
  },
  RJ: {
    stateCode: "RJ",
    stateName: "Rajasthan",
    rldcCode: "NRLDC",
    sldcApiEndpoint: "https://rvunl.com/sldc/api/v1/load/summary",
    backupSldcApiEndpoint: "https://backup.rvunl.com/sldc/api/v1/summary",
    baseCapacityMw: 15800
  },
  PB: {
    stateCode: "PB",
    stateName: "Punjab",
    rldcCode: "NRLDC",
    sldcApiEndpoint: "https://punjabsldc.org/api/v1/grid-metrics/realtime",
    backupSldcApiEndpoint: "https://backup.punjabsldc.org/api/v1/realtime",
    baseCapacityMw: 14200
  },
  HR: {
    stateCode: "HR",
    stateName: "Haryana",
    rldcCode: "NRLDC",
    sldcApiEndpoint: "https://hvpn.org.in/sldc/api/v1/load/active-status",
    backupSldcApiEndpoint: "https://backup.hvpn.org.in/sldc/api/load",
    baseCapacityMw: 10500
  },
  BR: {
    stateCode: "BR",
    stateName: "Bihar",
    rldcCode: "ERLDC",
    sldcApiEndpoint: "https://biharsldc.in/api/v1/grid-status/live",
    backupSldcApiEndpoint: "https://backup.biharsldc.in/api/v1/status",
    baseCapacityMw: 6200
  },
  OD: {
    stateCode: "OD",
    stateName: "Odisha",
    rldcCode: "ERLDC",
    sldcApiEndpoint: "https://optcl.co.in/sldc/api/v1/demand/system-load",
    backupSldcApiEndpoint: "https://backup.optcl.co.in/sldc/api/demand",
    baseCapacityMw: 5200
  },
  JH: {
    stateCode: "JH",
    stateName: "Jharkhand",
    rldcCode: "ERLDC",
    sldcApiEndpoint: "https://jussnl.co.in/sldc/api/v1/load/system-metrics",
    backupSldcApiEndpoint: "https://backup.jussnl.co.in/sldc/api/metrics",
    baseCapacityMw: 1400
  },
  CG: {
    stateCode: "CG",
    stateName: "Chhattisgarh",
    rldcCode: "WRLDC",
    sldcApiEndpoint: "https://sldccg.gov.in/api/v1/grid-metrics/scada-feed",
    backupSldcApiEndpoint: "https://backup.sldccg.gov.in/api/v1/scada",
    baseCapacityMw: 4400
  },
  AS: {
    stateCode: "AS",
    stateName: "Assam",
    rldcCode: "NERLDC",
    sldcApiEndpoint: "https://asldc.org/api/v1/load-status/live-feed",
    backupSldcApiEndpoint: "https://backup.asldc.org/api/v1/live",
    baseCapacityMw: 1800
  },
  HP: {
    stateCode: "HP",
    stateName: "Himachal Pradesh",
    rldcCode: "NRLDC",
    sldcApiEndpoint: "https://hpsldc.org/api/v1/power-flow/reservoir-discharge",
    backupSldcApiEndpoint: "https://backup.hpsldc.org/api/v1/power",
    baseCapacityMw: 1600
  },
  UK: {
    stateCode: "UK",
    stateName: "Uttarakhand",
    rldcCode: "NRLDC",
    sldcApiEndpoint: "https://uksldc.org/api/v1/grid-demand/hvac-impact",
    backupSldcApiEndpoint: "https://backup.uksldc.org/api/v1/grid-demand",
    baseCapacityMw: 2200
  },
  JK: {
    stateCode: "JK",
    stateName: "Jammu & Kashmir",
    rldcCode: "NRLDC",
    sldcApiEndpoint: "https://jksldc.org/api/v1/load/distribution-summary",
    backupSldcApiEndpoint: "https://backup.jksldc.org/api/v1/load",
    baseCapacityMw: 2900
  },
  GA: {
    stateCode: "GA",
    stateName: "Goa",
    rldcCode: "WRLDC",
    sldcApiEndpoint: "https://goasldc.gov.in/api/v1/grid-status/telemetry",
    backupSldcApiEndpoint: "https://backup.goasldc.gov.in/api/v1/telemetry",
    baseCapacityMw: 600
  },
  SK: {
    stateCode: "SK",
    stateName: "Sikkim",
    rldcCode: "ERLDC",
    sldcApiEndpoint: "https://sikkimsldc.gov.in/api/v1/power-load/hydel-feed",
    backupSldcApiEndpoint: "https://backup.sikkimsldc.gov.in/api/power-load",
    baseCapacityMw: 150
  },
  ML: {
    stateCode: "ML",
    stateName: "Meghalaya",
    rldcCode: "NERLDC",
    sldcApiEndpoint: "https://mesldc.org/api/v1/generation-load/scada",
    backupSldcApiEndpoint: "https://backup.mesldc.org/api/v1/generation",
    baseCapacityMw: 380
  },
  MN: {
    stateCode: "MN",
    stateName: "Manipur",
    rldcCode: "NERLDC",
    sldcApiEndpoint: "https://manipurtransco.com/sldc/api/v1/realtime/load",
    backupSldcApiEndpoint: "https://backup.manipurtransco.com/sldc/api/v1/load",
    baseCapacityMw: 250
  },
  MZ: {
    stateCode: "MZ",
    stateName: "Mizoram",
    rldcCode: "NERLDC",
    sldcApiEndpoint: "https://mizoramsldc.gov.in/api/v1/loads/live-demand",
    backupSldcApiEndpoint: "https://backup.mizoramsldc.gov.in/api/loads",
    baseCapacityMw: 140
  },
  NL: {
    stateCode: "NL",
    stateName: "Nagaland",
    rldcCode: "NERLDC",
    sldcApiEndpoint: "https://nagalandsldc.org/api/v1/power-info/telemetry",
    backupSldcApiEndpoint: "https://backup.nagalandsldc.org/api/power-info",
    baseCapacityMw: 160
  },
  TR: {
    stateCode: "TR",
    stateName: "Tripura",
    rldcCode: "NERLDC",
    sldcApiEndpoint: "https://tripurasldc.gov.in/api/v1/grid-metrics/gas-generation",
    backupSldcApiEndpoint: "https://backup.tripurasldc.gov.in/api/metrics",
    baseCapacityMw: 320
  },
  AR: {
    stateCode: "AR",
    stateName: "Arunachal Pradesh",
    rldcCode: "NERLDC",
    sldcApiEndpoint: "https://arunachalsldc.org/api/v1/demand-status/live",
    backupSldcApiEndpoint: "https://backup.arunachalsldc.org/api/demand-status",
    baseCapacityMw: 240
  }
};
