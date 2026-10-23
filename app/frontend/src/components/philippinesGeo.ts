/**
 * Geometric vector coordinates for the major island groups of the Philippine Archipelago.
 * Scaled and normalized for Three.js 3D extrusion.
 * Longitude: ~117°E to 127°E -> X axis
 * Latitude: ~5°N to 19°N -> Z/Y axis (projected)
 */

export interface IslandPath {
  name: string;
  region: 'luzon' | 'visayas' | 'mindanao' | 'palawan';
  elevation: number;
  color?: string;
  points: [number, number][]; // [lon, lat]
}

// Center point of projection (near Metro Manila)
export const PROJECTION_CENTER = {
  lon: 121.5,
  lat: 12.5,
  scale: 1.8 // Scale factor for Three.js units
};

export function geoTo3D(lon: number, lat: number): [number, number] {
  const x = (lon - PROJECTION_CENTER.lon) * PROJECTION_CENTER.scale;
  // Invert lat for Three.js top-down Y/Z coordinate convention
  const z = -(lat - PROJECTION_CENTER.lat) * PROJECTION_CENTER.scale;
  return [x, z];
}

export const PHILIPPINES_ISLANDS: IslandPath[] = [
  // 1. MAIN LUZON (Northern to Central Luzon & Bicol Peninsula)
  {
    name: 'Luzon',
    region: 'luzon',
    elevation: 0.35,
    points: [
      [120.6, 18.6], [121.2, 18.5], [122.2, 18.3], [122.4, 17.0],
      [122.5, 15.9], [121.6, 15.4], [121.7, 14.7], [122.4, 14.3],
      [123.0, 14.2], [123.8, 13.8], [124.1, 13.5], [124.0, 12.8],
      [123.5, 12.9], [123.2, 13.5], [122.6, 13.6], [122.3, 13.9],
      [121.6, 13.7], [121.0, 13.8], [120.6, 14.2], [120.5, 14.8],
      [119.8, 15.8], [120.3, 16.3], [120.4, 17.5], [120.5, 18.5]
    ]
  },
  // 2. MINDORO
  {
    name: 'Mindoro',
    region: 'luzon',
    elevation: 0.28,
    points: [
      [120.5, 13.5], [121.2, 13.4], [121.5, 12.8], [121.4, 12.3],
      [121.1, 12.2], [120.8, 12.8], [120.4, 13.2]
    ]
  },
  // 3. PALAWAN
  {
    name: 'Palawan',
    region: 'palawan',
    elevation: 0.25,
    points: [
      [119.4, 11.4], [119.6, 11.0], [118.8, 10.1], [118.3, 9.7],
      [117.8, 9.0], [117.2, 8.5], [117.4, 8.7], [118.0, 9.4],
      [118.5, 9.9], [119.0, 10.5], [119.3, 11.1]
    ]
  },
  // 4. PANAY
  {
    name: 'Panay',
    region: 'visayas',
    elevation: 0.26,
    points: [
      [122.1, 11.8], [122.9, 11.6], [123.1, 11.1], [122.6, 10.6],
      [121.9, 10.5], [122.0, 11.2]
    ]
  },
  // 5. NEGROS
  {
    name: 'Negros',
    region: 'visayas',
    elevation: 0.28,
    points: [
      [123.3, 11.0], [123.5, 10.6], [123.3, 9.8], [123.1, 9.1],
      [122.8, 9.3], [122.4, 10.0], [122.9, 10.8]
    ]
  },
  // 6. CEBU
  {
    name: 'Cebu',
    region: 'visayas',
    elevation: 0.24,
    points: [
      [124.0, 11.2], [124.0, 10.7], [123.6, 10.0], [123.3, 9.5],
      [123.4, 9.8], [123.8, 10.5], [123.9, 11.1]
    ]
  },
  // 7. BOHOL
  {
    name: 'Bohol',
    region: 'visayas',
    elevation: 0.22,
    points: [
      [124.1, 10.1], [124.5, 10.0], [124.4, 9.6], [123.8, 9.6],
      [123.9, 9.9]
    ]
  },
  // 8. LEYTE
  {
    name: 'Leyte',
    region: 'visayas',
    elevation: 0.25,
    points: [
      [124.5, 11.4], [124.8, 11.3], [125.0, 10.8], [125.0, 10.2],
      [124.7, 10.3], [124.6, 10.8]
    ]
  },
  // 9. SAMAR
  {
    name: 'Samar',
    region: 'visayas',
    elevation: 0.27,
    points: [
      [124.5, 12.5], [125.1, 12.4], [125.6, 11.9], [125.6, 11.1],
      [125.1, 11.3], [124.8, 11.8], [124.5, 12.1]
    ]
  },
  // 10. MINDANAO
  {
    name: 'Mindanao',
    region: 'mindanao',
    elevation: 0.38,
    points: [
      [125.5, 9.8], [126.1, 9.1], [126.3, 8.0], [126.3, 7.0],
      [125.7, 6.2], [125.1, 5.6], [124.6, 6.0], [124.0, 6.8],
      [123.3, 7.3], [122.2, 7.1], [122.0, 7.8], [123.0, 8.2],
      [123.8, 8.5], [124.6, 8.6], [125.1, 9.0]
    ]
  }
];

export interface CityMarker {
  id: 'dengue' | 'lepto';
  name: string;
  disease: string;
  shortDesc: string;
  lon: number;
  lat: number;
  color: string;
  accent: string;
}

export const TARGET_CITIES: CityMarker[] = [
  {
    id: 'dengue',
    name: 'Quezon City',
    disease: 'Dengue Nowcast',
    shortDesc: '2010–2025 Poisson Model · Rainfall-driven',
    lon: 121.05,
    lat: 14.65,
    color: '#E11D48', // Coral rose / amber alert
    accent: '#FDA4AF'
  },
  {
    id: 'lepto',
    name: 'City of Manila',
    disease: 'Leptospirosis Alert',
    shortDesc: '2001–2012 Multi-week lag & Flood exposure',
    lon: 120.98,
    lat: 14.59,
    color: '#0D9488', // Deep teal
    accent: '#5EEAD4'
  }
];
