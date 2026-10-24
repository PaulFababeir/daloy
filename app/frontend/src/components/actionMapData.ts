/**
 * Verified Geo-Coordinates & Boundaries for Metro Manila (NCR)
 * Action Plan Layers:
 *  1. Vulnerable Barangay Sub-Polygons (Quezon City & Manila)
 *  2. Tertiary Referral Hospitals (Dengue Fast-Lanes & Leptospirosis Renal/ICU)
 *  3. Super Health Centers & Prophylaxis Staging Stations (NS1, ORS, Doxycycline PEP)
 *  4. Primary LGU/DOH Hospitals across all 17 NCR Cities
 */

export type ActionLayerFilter = 'all' | 'hotspots' | 'hospitals' | 'clinics' | 'off';

export interface VulnerableBarangayZone {
  id: string;
  name: string;
  city: 'Quezon City' | 'Manila';
  disease: 'dengue' | 'lepto';
  risk: 'High' | 'Medium' | 'Low';
  level: 1 | 2 | 3;
  center: [number, number]; // [lon, lat]
  polygon: [number, number][]; // [lon, lat][]
  desc: string;
  actionCodes: string[];
  actionSummary: string;
}

export interface HealthFacilityNode {
  id: string;
  name: string;
  shortName: string;
  city: string; // Matches METRO_MANILA_CITIES[i].name
  diseaseScope: 'dengue' | 'lepto' | 'ncr';
  type: 'hospital' | 'health_center';
  category: string;
  coords: [number, number]; // [lon, lat]
  address: string;
  role: string;
  actionCodes: string[];
}

export const VULNERABLE_BARANGAY_ZONES: VulnerableBarangayZone[] = [
  // ================= QUEZON CITY (DENGUE HOTSPOTS) =================
  {
    id: 'qc-tatalon',
    name: 'Barangay Tatalon',
    city: 'Quezon City',
    disease: 'dengue',
    risk: 'High',
    level: 3,
    center: [121.0153, 14.6242],
    polygon: [
      [121.0085, 14.6190],
      [121.0215, 14.6195],
      [121.0225, 14.6285],
      [121.0145, 14.6295],
      [121.0080, 14.6255]
    ],
    desc: 'San Juan River overflow basin (District 4); dense residential drainage corridor with rapid post-flood container breeding.',
    actionCodes: ['4S', 'PIO'],
    actionSummary: 'Priority 4S vector sweep & larviciding within 48h of rainfall; early fever consultation broadcasts.'
  },
  {
    id: 'qc-bagong-silangan',
    name: 'Barangay Bagong Silangan',
    city: 'Quezon City',
    disease: 'dengue',
    risk: 'High',
    level: 3,
    center: [121.1050, 14.7060],
    polygon: [
      [121.0950, 14.6960],
      [121.1095, 14.6980],
      [121.1145, 14.7140],
      [121.1020, 14.7180],
      [121.0930, 14.7070]
    ],
    desc: 'Upper Marikina River tributary floodplain (District 2); rapid monsoon sheet flooding & stagnant ground pools.',
    actionCodes: ['4S', 'PIO'],
    actionSummary: 'Deploy BHW 4S cleanups across Marikina floodplain pockets & stage NS1/ORS at Bagong Silangan HC.'
  },
  {
    id: 'qc-roxas',
    name: 'Barangay Roxas District',
    city: 'Quezon City',
    disease: 'dengue',
    risk: 'Medium',
    level: 2,
    center: [121.0216, 14.6283],
    polygon: [
      [121.0175, 14.6245],
      [121.0260, 14.6250],
      [121.0265, 14.6320],
      [121.0180, 14.6318]
    ],
    desc: 'Low-elevation basin near Diliman Creek & Scout area outlets (District 4); chronic storm drain backflow.',
    actionCodes: ['4S', 'PIO'],
    actionSummary: 'Clear storm-drain catch basins and conduct household container inspections.'
  },
  {
    id: 'qc-dona-imelda',
    name: 'Barangay Doña Imelda',
    city: 'Quezon City',
    disease: 'dengue',
    risk: 'Medium',
    level: 2,
    center: [121.0177, 14.6151],
    polygon: [
      [121.0130, 14.6110],
      [121.0220, 14.6115],
      [121.0225, 14.6188],
      [121.0135, 14.6185]
    ],
    desc: 'Borders San Juan River & Araneta Ave bridge (District 4); slow-draining interior alleys during monsoon surges.',
    actionCodes: ['4S', 'PIO'],
    actionSummary: 'Targeted alley larviciding and public fever warning advisory.'
  },
  {
    id: 'qc-batasan-hills',
    name: 'Barangay Batasan Hills',
    city: 'Quezon City',
    disease: 'dengue',
    risk: 'Low',
    level: 1,
    center: [121.0945, 14.6835],
    polygon: [
      [121.0830, 14.6730],
      [121.1040, 14.6740],
      [121.1060, 14.6930],
      [121.0890, 14.6945],
      [121.0815, 14.6840]
    ],
    desc: 'High-population District 2 terrain (~160k residents); localized gully ponding & domestic water storage containers.',
    actionCodes: ['4S', 'Rx'],
    actionSummary: 'Routine domestic container checks and NS1 rapid testing at Batasan Hills Super Health Center.'
  },

  // ================= CITY OF MANILA (LEPTOSPIROSIS HOTSPOTS) =================
  {
    id: 'mnl-sampaloc',
    name: 'Barangay Sampaloc (España Corridor)',
    city: 'Manila',
    disease: 'lepto',
    risk: 'High',
    level: 3,
    center: [120.9965, 14.6075],
    polygon: [
      [120.9865, 14.6010],
      [121.0055, 14.6020],
      [121.0035, 14.6135],
      [120.9920, 14.6165],
      [120.9855, 14.6085]
    ],
    desc: 'Topographic flood bowl along España Blvd & Maceda/Antipolo (District IV); #1 commuter flood-wading cluster zone.',
    actionCodes: ['Dx', '!'],
    actionSummary: 'Immediate 200mg Doxycycline PEP distribution within 24–72h & strict anti-wading advisories along España.'
  },
  {
    id: 'mnl-tondo',
    name: 'Barangay Tondo I & II',
    city: 'Manila',
    disease: 'lepto',
    risk: 'High',
    level: 3,
    center: [120.9680, 14.6185],
    polygon: [
      [120.9580, 14.6060],
      [120.9765, 14.6070],
      [120.9780, 14.6310],
      [120.9610, 14.6320],
      [120.9565, 14.6190]
    ],
    desc: 'Coastal Manila Bay & Estero de Vitas tidal basin (Districts I & II); high wading frequency & drainage backflow.',
    actionCodes: ['Dx', '!'],
    actionSummary: 'Mass Doxycycline prophylaxis at Tondo health stations and protective boot distribution for crews.'
  },
  {
    id: 'mnl-ermita',
    name: 'Barangay Ermita - Taft Ave',
    city: 'Manila',
    disease: 'lepto',
    risk: 'Medium',
    level: 2,
    center: [120.9835, 14.5815],
    polygon: [
      [120.9795, 14.5755],
      [120.9895, 14.5760],
      [120.9905, 14.5890],
      [120.9785, 14.5885]
    ],
    desc: 'Low-lying Taft Ave / UN Ave transit corridor (District V); storm-drain backup exposing commuters & pedestrians.',
    actionCodes: ['!', 'Dx'],
    actionSummary: 'Commuter floodwater wading alerts along Taft Ave and PEP triage near PGH.'
  },
  {
    id: 'mnl-santa-ana',
    name: 'Barangay Santa Ana',
    city: 'Manila',
    disease: 'lepto',
    risk: 'Medium',
    level: 2,
    center: [121.0115, 14.5815],
    polygon: [
      [121.0040, 14.5765],
      [121.0165, 14.5800],
      [121.0185, 14.5865],
      [121.0050, 14.5870]
    ],
    desc: 'Pasig River tidal meander & San Juan River confluence (District VI); vulnerable during monsoon high tides.',
    actionCodes: ['!', 'Dx'],
    actionSummary: 'Riverbank flood exposure monitoring and prophylaxis staging at Sta. Ana Hospital / District VI clinics.'
  },
  {
    id: 'mnl-paco',
    name: 'Barangay Paco',
    city: 'Manila',
    disease: 'lepto',
    risk: 'Low',
    level: 1,
    center: [120.9945, 14.5810],
    polygon: [
      [120.9895, 14.5750],
      [121.0020, 14.5755],
      [121.0025, 14.5870],
      [120.9900, 14.5865]
    ],
    desc: 'Estero de Paco catchment (District V); mitigated by MMDA pumping station operations and estero dredging.',
    actionCodes: ['Rx', 'Dx'],
    actionSummary: 'Maintain baseline Doxycycline & antibiotic buffer stocks at Paco Health Center.'
  }
];

export const HEALTH_FACILITIES: HealthFacilityNode[] = [
  // ================= QUEZON CITY HOSPITALS & HEALTH CENTERS (10) =================
  {
    id: 'qc-eamc',
    name: 'East Avenue Medical Center (EAMC)',
    shortName: 'East Ave Med Ctr',
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'hospital',
    category: 'DOH Level 3 Tertiary Referral',
    coords: [121.0492, 14.6398],
    address: 'East Ave, Diliman, Quezon City',
    role: '1,000-bed DOH apex center; primary Dengue Fast-Lane, IV hydration bays & ICU surge hub.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'qc-nkti',
    name: 'National Kidney and Transplant Institute (NKTI)',
    shortName: 'NKTI',
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'hospital',
    category: 'DOH Specialty Tertiary',
    coords: [121.0480, 14.6476],
    address: 'East Ave, Diliman, Quezon City',
    role: 'National renal & hematology referral center; hemodialysis surge & severe dengue shock management.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'qc-qcgh',
    name: 'Quezon City General Hospital (QCGH)',
    shortName: 'QC General Hospital',
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'hospital',
    category: 'LGU Level 3 Tertiary',
    coords: [121.0182, 14.6612],
    address: 'Seminary Rd, Brgy. Bahay Toro, District 1, QC',
    role: 'Flagship QC LGU hospital operating 24/7 Dengue Fast-Lanes and ambulatory IV rehydration bays.',
    actionCodes: ['IV']
  },
  {
    id: 'qc-pcmc',
    name: "Philippine Children's Medical Center (PCMC)",
    shortName: "Phil Children's Med Ctr",
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'hospital',
    category: 'DOH Pediatric Specialty Tertiary',
    coords: [121.0398, 14.6512],
    address: 'Quezon Ave cor. Agham Rd, Diliman, QC',
    role: 'Apex pediatric referral hospital for severe pediatric dengue shock syndrome (DSS) & PICU triage.',
    actionCodes: ['IV']
  },
  {
    id: 'qc-qmmc',
    name: 'Quirino Memorial Medical Center (QMMC)',
    shortName: 'Quirino Memorial Med Ctr',
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'hospital',
    category: 'DOH Level 3 Tertiary',
    coords: [121.0724, 14.6222],
    address: 'J.P. Rizal St cor. P. Tuazon Blvd, Project 4, QC',
    role: 'Eastern QC DOH tertiary referral hospital serving Districts 3 & 4 and Marikina basin overflow.',
    actionCodes: ['IV']
  },
  {
    id: 'qc-ndh',
    name: 'Novaliches District Hospital (NDH)',
    shortName: 'Novaliches Dist Hosp',
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'hospital',
    category: 'LGU Level 2 District Hospital',
    coords: [121.0375, 14.7089],
    address: 'Quirino Hwy, Brgy. San Bartolome, Novaliches, QC',
    role: 'Northern QC LGU hospital covering Tullahan River basin barangays for dengue inpatient hydration.',
    actionCodes: ['IV']
  },
  {
    id: 'qc-batasan-shc',
    name: 'Batasan Hills Super Health Center',
    shortName: 'Batasan Super HC',
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'health_center',
    category: 'QCHD Super Health Center',
    coords: [121.0922, 14.6816],
    address: 'IBP Rd cor. Commonwealth Ave, Brgy. Batasan Hills, QC',
    role: 'District 2 hub staging 1.6x buffer of NS1 rapid diagnostic kits, CBC/platelet counts & ORS packs.',
    actionCodes: ['Rx', '4S']
  },
  {
    id: 'qc-tatalon-hc',
    name: 'Tatalon Health Center',
    shortName: 'Tatalon Health Ctr',
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'health_center',
    category: 'QCHD Barangay Health Center',
    coords: [121.0142, 14.6213],
    address: '33 Victory Ave, Brgy. Tatalon, District 4, QC',
    role: 'Frontline NS1 antigen testing, ORS staging & BHW 4S vector sweep dispatch in the San Juan River basin.',
    actionCodes: ['Rx', '4S']
  },
  {
    id: 'qc-bagong-silangan-hc',
    name: 'Bagong Silangan Health Center',
    shortName: 'Bagong Silangan HC',
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'health_center',
    category: 'QCHD Barangay Health Center',
    coords: [121.1075, 14.7065],
    address: 'Bonifacio St, Brgy. Bagong Silangan, District 2, QC',
    role: 'Frontline fever triage, larviciding dispatch & ORS/NS1 staging for Marikina floodplain residents.',
    actionCodes: ['Rx', '4S']
  },
  {
    id: 'qc-kamuning-shc',
    name: 'Kamuning Super Health Center',
    shortName: 'Kamuning Super HC',
    city: 'Quezon City',
    diseaseScope: 'dengue',
    type: 'health_center',
    category: 'QCHD Super Health Center',
    coords: [121.0422, 14.6273],
    address: '19 T. Gener St cor. K-5th St, Brgy. Kamuning, District 4, QC',
    role: 'District 4 diagnostic & outpatient hydration hub buffering EAMC and QCGH emergency wards.',
    actionCodes: ['Rx']
  },

  // ================= CITY OF MANILA HOSPITALS & HEALTH CENTERS (10) =================
  {
    id: 'mnl-pgh',
    name: 'Philippine General Hospital (PGH)',
    shortName: 'PGH (UP Manila)',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'hospital',
    category: 'National University Tertiary',
    coords: [120.9855, 14.5780],
    address: 'Taft Ave, Ermita, Manila',
    role: "1,500-bed national referral center; primary acute dialysis, ICU & severe Weil's disease management hub.",
    actionCodes: ['H', 'Rx']
  },
  {
    id: 'mnl-slh',
    name: 'San Lazaro Hospital (SLH)',
    shortName: 'San Lazaro Hospital',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'hospital',
    category: 'DOH Infectious Disease Specialty',
    coords: [120.9852, 14.6182],
    address: 'Quiricada St, Sta. Cruz, Manila',
    role: 'National apex infectious disease hospital; dedicated leptospirosis & dengue isolation pavilions.',
    actionCodes: ['H', 'Rx']
  },
  {
    id: 'mnl-ommc',
    name: 'Ospital ng Maynila Medical Center (OMMC)',
    shortName: 'Ospital ng Maynila',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'hospital',
    category: 'LGU Level 3 Tertiary',
    coords: [120.9864, 14.5639],
    address: 'Quirino Ave cor. Roxas Blvd, Malate, Manila',
    role: 'Flagship Manila LGU tertiary hospital providing renal replacement therapy, ICU & IV Penicillin G.',
    actionCodes: ['H', 'Rx']
  },
  {
    id: 'mnl-jrrmmc',
    name: 'Jose R. Reyes Memorial Medical Center (JRRMMC)',
    shortName: 'Jose Reyes Med Ctr',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'hospital',
    category: 'DOH Level 3 Tertiary',
    coords: [120.9808, 14.6105],
    address: 'Rizal Ave, Sta. Cruz, Manila',
    role: 'Major DOH tertiary center adjacent to San Lazaro handling critical emergency & internal medicine surge.',
    actionCodes: ['H']
  },
  {
    id: 'mnl-osp-sampaloc',
    name: 'Ospital ng Sampaloc',
    shortName: 'Ospital ng Sampaloc',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'hospital',
    category: 'LGU District IV Hospital',
    coords: [120.9967, 14.6078],
    address: '677 Gen. Geronimo St, Sampaloc, Manila',
    role: 'District IV hospital directly serving the España Blvd flood corridor for acute leptospirosis triage & PEP.',
    actionCodes: ['H', 'Dx', 'Rx']
  },
  {
    id: 'mnl-osp-tondo',
    name: 'Ospital ng Tondo',
    shortName: 'Ospital ng Tondo',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'hospital',
    category: 'LGU District II Hospital',
    coords: [120.9783, 14.6260],
    address: 'Jose Abad Santos Ave, Tondo, Manila',
    role: 'District II hospital serving northern Tondo & Estero de Vitas high-exposure flood zones.',
    actionCodes: ['H', 'Dx', 'Rx']
  },
  {
    id: 'mnl-gabmmc',
    name: 'Gat Andres Bonifacio Memorial Medical Center',
    shortName: 'Gat Andres Bonifacio MC',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'hospital',
    category: 'LGU Level 2 District I Hospital',
    coords: [120.9648, 14.6011],
    address: '8001 Delpan St, Tondo, Manila',
    role: 'High-volume District I hospital covering coastal Tondo I & port-area communities for flood-borne disease.',
    actionCodes: ['H', 'Rx']
  },
  {
    id: 'mnl-sta-ana-hosp',
    name: 'Sta. Ana Hospital (MIDCC)',
    shortName: 'Sta. Ana Hospital',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'hospital',
    category: 'LGU Level 2 District VI Hospital',
    coords: [121.0164, 14.5834],
    address: 'New Panaderos St, Sta. Ana, Manila',
    role: 'Houses the Manila Infectious Disease Control Center (MIDCC) serving Pasig River bend barangays.',
    actionCodes: ['H', 'Rx']
  },
  {
    id: 'mnl-jjasgh',
    name: 'Justice Jose Abad Santos General Hospital',
    shortName: 'Abad Santos Gen Hosp',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'health_center',
    category: 'LGU District III Triage & PEP Hub',
    coords: [120.9772, 14.5958],
    address: 'Numancia St, Binondo/San Nicolas, Manila',
    role: 'District III hub staging post-flood Doxycycline prophylaxis & IV antibiotics for low-lying estero zones.',
    actionCodes: ['Dx', 'Rx']
  },
  {
    id: 'mnl-paco-hc',
    name: 'Paco Health Center (MHD District V)',
    shortName: 'Paco Health Center',
    city: 'Manila',
    diseaseScope: 'lepto',
    type: 'health_center',
    category: 'MHD Primary Health Center',
    coords: [120.9922, 14.5812],
    address: 'Paz St / Pedro Gil, Paco, Manila',
    role: 'Frontline Manila Health Department station distributing single-dose 200mg Doxycycline PEP along Estero de Paco.',
    actionCodes: ['Dx', 'Rx']
  },

  // ================= OTHER 15 METRO MANILA CITIES PRIMARY HOSPITALS =================
  {
    id: 'ncr-caloocan',
    name: 'Caloocan City Medical Center (South)',
    shortName: 'Caloocan Med Ctr',
    city: 'Caloocan',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Level 2 Referral Hospital',
    coords: [120.9736, 14.6483],
    address: '450 A. Mabini St, Poblacion, South Caloocan',
    role: 'Primary LGU referral hospital for southern Caloocan & Tullahan drainage basin.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-las-pinas',
    name: 'Las Piñas General Hospital & Satellite Trauma Center',
    shortName: 'Las Piñas Gen Hosp',
    city: 'Las Piñas',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'DOH Level 2 Trauma & Referral',
    coords: [120.9737, 14.4716],
    address: 'Diego Cera Ave, Pulanglupa I, Las Piñas',
    role: 'DOH southern coastal NCR trauma & infectious disease referral center.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-makati',
    name: 'Ospital ng Makati (OsMak)',
    shortName: 'Ospital ng Makati',
    city: 'Makati',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Level 3 Tertiary',
    coords: [121.0619, 14.5463],
    address: 'Sampaguita St, Makati',
    role: '300-bed Level 3 LGU tertiary center with full ICU, nephrology & infectious disease wards.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-malabon',
    name: 'Ospital ng Malabon (OsMa)',
    shortName: 'Ospital ng Malabon',
    city: 'Malabon',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Hospital (CAMANAVA Basin)',
    coords: [120.9506, 14.6573],
    address: 'F. Sevilla Blvd, Brgy. Tañong, Malabon',
    role: 'Frontline LGU hospital for perennial CAMANAVA tidal & riverine flood zones.',
    actionCodes: ['IV', 'H', 'Dx']
  },
  {
    id: 'ncr-mandaluyong',
    name: 'Mandaluyong City Medical Center (MCMC)',
    shortName: 'Mandaluyong Med Ctr',
    city: 'Mandaluyong',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Level 2 Hospital',
    coords: [121.0353, 14.5761],
    address: '605 Boni Ave, Brgy. Plainview, Mandaluyong',
    role: 'Primary LGU hospital serving Maysilo Circle & San Juan-Pasig River confluence zones.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-marikina',
    name: 'Amang Rodriguez Memorial Medical Center (ARMMC)',
    shortName: 'Amang Rodriguez MC',
    city: 'Marikina',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'DOH Level 3 Tertiary',
    coords: [121.0984, 14.6360],
    address: 'Sumulong Hwy, Brgy. Sto. Niño, Marikina',
    role: '500-bed DOH tertiary hospital; primary surge center for Marikina River Valley floods.',
    actionCodes: ['IV', 'H', 'Dx']
  },
  {
    id: 'ncr-muntinlupa',
    name: 'Ospital ng Muntinlupa (OsMun)',
    shortName: 'Ospital ng Muntinlupa',
    city: 'Muntinlupa',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Level 2 Hospital',
    coords: [121.0442, 14.4142],
    address: 'Civic Drive, Filinvest Corporate City, Alabang, Muntinlupa',
    role: 'Primary LGU hospital serving Laguna de Bay lakeshore barangays (alongside DOH RITM).',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-navotas',
    name: 'Navotas City Hospital (NCH)',
    shortName: 'Navotas City Hospital',
    city: 'Navotas',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Coastal Referral Hospital',
    coords: [120.9459, 14.6601],
    address: 'M. Naval St, Brgy. San Jose, Navotas',
    role: 'Coastal LGU hospital managing high-frequency tidal inundation & leptospirosis prophylaxis.',
    actionCodes: ['IV', 'H', 'Dx']
  },
  {
    id: 'ncr-paranaque',
    name: 'Ospital ng Parañaque (OsPar District II)',
    shortName: 'Ospital ng Parañaque',
    city: 'Parañaque',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Level 2 Hospital',
    coords: [121.0242, 14.4880],
    address: 'Doña Soledad Ave, Don Bosco, Parañaque',
    role: 'LGU hospital serving Parañaque Creek & inland flood basins.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-pasay',
    name: 'Pasay City General Hospital (PCGH)',
    shortName: 'Pasay City Gen Hosp',
    city: 'Pasay',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Level 2 Hospital',
    coords: [121.0009, 14.5493],
    address: 'P. Burgos St, Maricaban/Malibay area, Pasay',
    role: 'LGU hospital serving Tripa de Gallina & Maricaban Creek flood pockets.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-pasig-rmc',
    name: 'Rizal Medical Center (RMC)',
    shortName: 'Rizal Medical Center',
    city: 'Pasig',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'DOH Level 3 Tertiary',
    coords: [121.0659, 14.5640],
    address: 'Pasig Blvd, Brgy. Bagong Ilog, Pasig',
    role: 'DOH Level 3 apex referral hospital along the Pasig River corridor.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-pasig-pcgh',
    name: 'Pasig City General Hospital (PCGH)',
    shortName: 'Pasig City Gen Hosp',
    city: 'Pasig',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Level 2 Hospital',
    coords: [121.0994, 14.5722],
    address: 'M. Eusebio Ave, Brgy. Maybunga, Pasig',
    role: 'LGU referral hospital adjacent to the Manggahan Floodway & Marikina-Pasig confluence.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-pateros',
    name: 'Pateros Municipal Health Office & Triage Hub',
    shortName: 'Pateros Health Hub',
    city: 'Pateros',
    diseaseScope: 'ncr',
    type: 'health_center',
    category: 'LGU Municipal Health Office',
    coords: [121.0683, 14.5453],
    address: 'G. de Borja St, Aguho/Poblacion, Pateros',
    role: 'Primary municipal fever triage & flood prophylaxis hub along the Pateros-Taguig River channel.',
    actionCodes: ['Rx', 'Dx']
  },
  {
    id: 'ncr-san-juan',
    name: 'San Juan Medical Center (SJMC)',
    shortName: 'San Juan Med Ctr',
    city: 'San Juan',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Level 2 Hospital',
    coords: [121.0255, 14.6048],
    address: 'N. Domingo St, Brgy. Balong-Bato, San Juan',
    role: 'Primary LGU hospital directly serving San Juan River overflow barangays (Salapan, Batis, Progreso).',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-taguig',
    name: 'Taguig-Pateros District Hospital (TPDH)',
    shortName: 'Taguig-Pateros Dist Hosp',
    city: 'Taguig',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'LGU Level 2 District Hospital',
    coords: [121.0341, 14.5108],
    address: 'East Service Rd, Brgy. Western Bicutan, Taguig',
    role: 'Primary public district hospital serving Taguig River & Laguna de Bay lakeshore flood zones.',
    actionCodes: ['IV', 'H']
  },
  {
    id: 'ncr-valenzuela',
    name: 'Valenzuela Medical Center (VMC)',
    shortName: 'Valenzuela Med Ctr',
    city: 'Valenzuela',
    diseaseScope: 'ncr',
    type: 'hospital',
    category: 'DOH Level 3 Tertiary',
    coords: [120.9788, 14.6920],
    address: 'Padrigal St, Brgy. Karuhatan, Valenzuela',
    role: 'DOH tertiary referral hospital serving northern NCR & Meycauayan–Tullahan River basins.',
    actionCodes: ['IV', 'H']
  }
];

export function getBarangayZonesForDisease(disease: 'dengue' | 'lepto'): VulnerableBarangayZone[] {
  return VULNERABLE_BARANGAY_ZONES.filter(z => z.disease === disease);
}

export function getFacilitiesForCity(cityName: string): HealthFacilityNode[] {
  const normalized = cityName === 'City of Manila' ? 'Manila' : cityName;
  return HEALTH_FACILITIES.filter(f => f.city === normalized || f.city === cityName);
}

export function mapActionCodeToLayer(code: string): {
  layer: ActionLayerFilter;
  label: string;
} {
  switch (code) {
    case '4S':
    case '!':
    case 'PIO':
      return { layer: 'hotspots', label: 'Barangay Vulnerable Hotspots & Flood Corridors' };
    case 'IV':
    case 'H':
      return { layer: 'hospitals', label: 'Tertiary Referral Hospitals (Fast-Lanes & Renal/ICU)' };
    case 'Rx':
    case 'Dx':
      return { layer: 'clinics', label: 'Super Health Centers & Prophylaxis Staging Stations' };
    default:
      return { layer: 'all', label: 'All Tactical Action Layers' };
  }
}
