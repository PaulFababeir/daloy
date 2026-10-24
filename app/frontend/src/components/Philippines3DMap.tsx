import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  METRO_MANILA_CITIES,
  METRO_MANILA_RIVERS,
  ncrGeoTo3D,
  NCRCityPolygon
} from './metroManilaData';
import {
  HEALTH_FACILITIES,
  HealthFacilityNode,
  ActionLayerFilter
} from './actionMapData';
import {
  NCR_BARANGAYS,
  NCRBarangayPolygon
} from './ncrBarangayGeoData';
import {
  CloudRain,
  Compass,
  Grid,
  Waves,
  Layers,
  ShieldAlert,
  Building2,
  Cross,
  EyeOff,
  X
} from 'lucide-react';

export interface Philippines3DMapProps {
  activeDisease: 'dengue' | 'lepto';
  onSelectCity: (disease: 'dengue' | 'lepto') => void;
  onInspectCity?: (city: NCRCityPolygon | null) => void;
  inspectedCity?: NCRCityPolygon | null;
  rainfallIntensity?: number; // 0 to 1200 mm
  predictedCases?: number;
  theme?: 'light' | 'dark';
  paused?: boolean;
  actionLayerFilter?: ActionLayerFilter;
  onActionLayerFilterChange?: (filter: ActionLayerFilter) => void;
  focusedActionCode?: string | null;
  focusedTargetCoords?: [number, number] | null;
  onClearFocusedAction?: () => void;
}

type HoveredMapEntity =
  | { kind: 'city'; data: NCRCityPolygon }
  | { kind: 'barangay'; data: NCRBarangayPolygon }
  | { kind: 'facility'; data: HealthFacilityNode };

const DARK_GRAY_SHADES = [0x1E293B, 0x1E293B, 0x243244, 0x2C3B4E];
const LIGHT_GRAY_SHADES = [0xDBD4C8, 0xE2DCD2, 0xE9E3DA, 0xEDE8E1];

// Subtle 4-shade tonal palettes for non-vulnerable baseline barangays inside active/inspected cities
const DENGUE_BGY_DARK_SHADES = [0x9F1239, 0xBE123C, 0x881337, 0xAF163E];
const DENGUE_BGY_LIGHT_SHADES = [0xE11D48, 0xBE123C, 0xF43F5E, 0x9F1239];

const LEPTO_BGY_DARK_SHADES = [0x115E59, 0x0F766E, 0x134E4A, 0x0D9488];
const LEPTO_BGY_LIGHT_SHADES = [0x0D9488, 0x0F766E, 0x14B8A6, 0x115E59];

const INSPECTED_BGY_DARK_SHADES = [0x293548, 0x334155, 0x1E293B, 0x3B4C63];
const INSPECTED_BGY_LIGHT_SHADES = [0xD6CFC4, 0xC7BEB2, 0xDDD6CC, 0xBFB6AA];

const normalizeCityName = (name?: string | null): string => {
  if (!name) return '';
  const n = name.trim().toLowerCase();
  if (n === 'city of manila' || n === 'manila') return 'manila';
  if (n.startsWith('city of ')) return n.replace('city of ', '');
  return n;
};

export const Philippines3DMap: React.FC<Philippines3DMapProps> = ({
  activeDisease,
  onSelectCity,
  onInspectCity,
  inspectedCity,
  rainfallIntensity = 430,
  theme = 'dark',
  paused = false,
  actionLayerFilter = 'off',
  onActionLayerFilterChange,
  focusedActionCode = null,
  focusedTargetCoords = null,
  onClearFocusedAction
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipElRef = useRef<HTMLDivElement>(null);

  const [hoveredEntity, setHoveredEntity] = useState<HoveredMapEntity | null>(null);
  const [rainEnabled, setRainEnabled] = useState(true);
  const [riversEnabled, setRiversEnabled] = useState(true);
  const [cityGridEnabled, setCityGridEnabled] = useState(true);
  const [internalLayerFilter, setInternalLayerFilter] = useState<ActionLayerFilter>('off');

  const effectiveLayerFilter = onActionLayerFilterChange ? actionLayerFilter : internalLayerFilter;
  const setLayerFilter = (next: ActionLayerFilter) => {
    if (onActionLayerFilterChange) onActionLayerFilterChange(next);
    else setInternalLayerFilter(next);
  };

  const cityMeshesRef = useRef<{
    city: NCRCityPolygon;
    mesh: THREE.Mesh;
    border: THREE.LineLoop;
    baseDepth: number;
  }[]>([]);

  const barangayMeshesRef = useRef<{
    bgy: NCRBarangayPolygon;
    group: THREE.Group;
    meshes: THREE.Mesh[];
    borders: THREE.LineLoop[];
    baseDepth: number;
  }[]>([]);

  const facilityMeshesRef = useRef<{
    facility: HealthFacilityNode;
    group: THREE.Group;
    pillarMesh: THREE.Mesh;
    ringMesh: THREE.Mesh;
    hitMesh: THREE.Mesh;
  }[]>([]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const riversGroupRef = useRef<THREE.Group | null>(null);
  const lightsRef = useRef<{
    hemiLight?: THREE.HemisphereLight;
    dirLight?: THREE.DirectionalLight;
    waterMat?: THREE.MeshBasicMaterial;
    rainMat?: THREE.PointsMaterial;
    riverOuterMat?: THREE.MeshBasicMaterial;
    riverCoreMat?: THREE.MeshBasicMaterial;
  }>({});

  const hoveredKeyRef = useRef<string | null>(null);
  const activeDiseaseRef = useRef<'dengue' | 'lepto'>(activeDisease);
  activeDiseaseRef.current = activeDisease;

  const inspectedCityRef = useRef<NCRCityPolygon | null>(inspectedCity);
  inspectedCityRef.current = inspectedCity;

  const rainfallRef = useRef<number>(rainfallIntensity);
  rainfallRef.current = rainfallIntensity;

  const themeRef = useRef<'light' | 'dark'>(theme);
  themeRef.current = theme;

  const effectiveLayerFilterRef = useRef<ActionLayerFilter>(effectiveLayerFilter);
  effectiveLayerFilterRef.current = effectiveLayerFilter;

  const focusedActionCodeRef = useRef<string | null>(focusedActionCode);
  focusedActionCodeRef.current = focusedActionCode;

  const cityGridEnabledRef = useRef<boolean>(cityGridEnabled);
  cityGridEnabledRef.current = cityGridEnabled;

  const onInspectCityRef = useRef(onInspectCity);
  onInspectCityRef.current = onInspectCity;

  const onSelectCityRef = useRef(onSelectCity);
  onSelectCityRef.current = onSelectCity;

  const rainEnabledRef = useRef<boolean>(rainEnabled);
  rainEnabledRef.current = rainEnabled;
  const riversEnabledRef = useRef<boolean>(riversEnabled);
  riversEnabledRef.current = riversEnabled;
  const pausedRef = useRef<boolean>(paused);
  pausedRef.current = paused;

  // Camera orbit state
  const cameraTargetRef = useRef<{
    lookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
  }>({
    lookAt: new THREE.Vector3(0.1, 0, -0.8),
    currentLookAt: new THREE.Vector3(0.1, 0, -0.8)
  });

  const orbitRef = useRef({
    theta: -0.12,
    phi: 0.74,
    radius: 17.5,
    currentTheta: -0.12,
    currentPhi: 0.74,
    currentRadius: 17.5
  });

  // Camera presets
  const setCameraView = useCallback((preset: 'ncr' | 'qc' | 'manila' | 'top') => {
    if (preset === 'ncr') {
      const [cx, cz] = ncrGeoTo3D(121.03, 14.605);
      orbitRef.current.theta = -0.12;
      orbitRef.current.phi = 0.76;
      orbitRef.current.radius = 18.5;
      cameraTargetRef.current.lookAt.set(cx, 0, cz);
    } else if (preset === 'qc') {
      const [qx, qz] = ncrGeoTo3D(121.055, 14.662);
      orbitRef.current.theta = -0.08;
      orbitRef.current.phi = 0.66;
      orbitRef.current.radius = 10.5;
      cameraTargetRef.current.lookAt.set(qx, 0.25, qz);
    } else if (preset === 'manila') {
      const [mx, mz] = ncrGeoTo3D(120.985, 14.600);
      orbitRef.current.theta = 0.08;
      orbitRef.current.phi = 0.62;
      orbitRef.current.radius = 6.8;
      cameraTargetRef.current.lookAt.set(mx, 0.25, mz);
    } else if (preset === 'top') {
      const [cx, cz] = ncrGeoTo3D(121.03, 14.615);
      orbitRef.current.theta = 0;
      orbitRef.current.phi = 0.06;
      orbitRef.current.radius = 19.5;
      cameraTargetRef.current.lookAt.set(cx, 0, cz);
    }
  }, []);

  // Fly camera when inspectedCity, focusedTargetCoords, or focusedActionCode changes
  useEffect(() => {
    if (focusedTargetCoords) {
      const [tx, tz] = ncrGeoTo3D(focusedTargetCoords[0], focusedTargetCoords[1]);
      cameraTargetRef.current.lookAt.set(tx, 0.35, tz);
      orbitRef.current.radius = activeDisease === 'dengue' ? 7.2 : 5.2;
      orbitRef.current.phi = 0.58;
    } else if (focusedActionCode) {
      setCameraView(activeDisease === 'dengue' ? 'qc' : 'manila');
    } else if (inspectedCity) {
      if (inspectedCity.name === 'Quezon City') {
        setCameraView('qc');
      } else if (inspectedCity.name === 'City of Manila' || inspectedCity.name === 'Manila') {
        setCameraView('manila');
      } else if (inspectedCity.centroid) {
        const [cx, cz] = ncrGeoTo3D(inspectedCity.centroid[0], inspectedCity.centroid[1]);
        cameraTargetRef.current.lookAt.set(cx, 0.25, cz);
        orbitRef.current.radius = 8.5;
        orbitRef.current.phi = 0.65;
      }
    }
  }, [inspectedCity, focusedTargetCoords, focusedActionCode, activeDisease, setCameraView]);

  // Synchronize 17 Cities + Official PSA Barangay Polygons (Vulnerable & Non-Vulnerable) + Health Facility Markers
  // Reads from refs so that onMouseMove and all event listeners always access 100% fresh state!
  const syncCityAppearance = useCallback(() => {
    const isDark = themeRef.current === 'dark';
    const rainBoost = Math.max(0.7, Math.min(1.8, rainfallRef.current / 380));
    const baseDepth = 0.22;
    const activeFocusTopY = baseDepth * (1.45 * rainBoost);

    const curActiveDisease = activeDiseaseRef.current;
    const curInspectedCity = inspectedCityRef.current;
    const curLayerFilter = effectiveLayerFilterRef.current;
    const curCityGridEnabled = cityGridEnabledRef.current;
    const curFocusedAction = focusedActionCodeRef.current;

    // 1. Update 17 NCR City Polygons (STABLE heights - no jumping/swallowing on hover!)
    cityMeshesRef.current.forEach(({ city, mesh, border, baseDepth: cDepth }) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const lineMat = border.material as THREE.LineBasicMaterial;
      const isHovered = hoveredKeyRef.current === `city:${city.name}`;
      const isInspected = Boolean(curInspectedCity && normalizeCityName(curInspectedCity.name) === normalizeCityName(city.name));

      if (city.focusId === 'dengue') {
        const isActive = curActiveDisease === 'dengue';
        mat.color.setHex(isActive ? (isDark ? 0x881337 : 0xBE123C) : (isDark ? 0x4C0519 : 0x9F1239));
        mat.emissive.setHex(0xE11D48);
        mat.emissiveIntensity = isHovered ? (isDark ? 0.38 : 0.24) : isActive ? (isDark ? 0.14 : 0.08) : 0.03;
        
        // Stable elevation: isActive focuses to rainBoost height, isInspected to 1.25, else 1.0
        const hScale = isActive ? 1.45 * rainBoost : (isInspected ? 1.25 : 1.0);
        mesh.scale.y = hScale;
        const topY = cDepth * hScale;
        border.position.y = topY + 0.012;
        lineMat.color.setHex(isHovered ? 0xFFFFFF : (isDark ? 0xFDA4AF : 0xFFE4E6));
        lineMat.opacity = isHovered ? 1.0 : 0.85;
      } else if (city.focusId === 'lepto') {
        const isActive = curActiveDisease === 'lepto';
        mat.color.setHex(isActive ? (isDark ? 0x115E59 : 0x0F766E) : (isDark ? 0x134E4A : 0x115E59));
        mat.emissive.setHex(isDark ? 0x14B8A6 : 0x0D9488);
        mat.emissiveIntensity = isHovered ? (isDark ? 0.38 : 0.24) : isActive ? (isDark ? 0.16 : 0.08) : 0.03;
        
        // Stable elevation: isActive focuses to rainBoost height, isInspected to 1.25, else 1.0
        const hScale = isActive ? 1.45 * rainBoost : (isInspected ? 1.25 : 1.0);
        mesh.scale.y = hScale;
        const topY = cDepth * hScale;
        border.position.y = topY + 0.012;
        lineMat.color.setHex(isHovered ? 0xFFFFFF : (isDark ? 0x5EEAD4 : 0xCCFBF1));
        lineMat.opacity = isHovered ? 1.0 : 0.85;
      } else {
        const baseGray = isDark
          ? DARK_GRAY_SHADES[city.grayShade] || 0x1E293B
          : LIGHT_GRAY_SHADES[city.grayShade] || 0xE2DCD2;

        if (isInspected) {
          mat.color.setHex(isDark ? 0x334155 : 0xC7BEB2);
          mat.emissive.setHex(isDark ? 0x38BDF8 : 0x0284C7);
          mat.emissiveIntensity = isHovered ? (isDark ? 0.35 : 0.22) : (isDark ? 0.22 : 0.12);
          const hScale = 1.25;
          mesh.scale.y = hScale;
          const topY = cDepth * hScale;
          border.position.y = topY + 0.012;
          lineMat.color.setHex(isDark ? 0x7DD3FC : 0x0284C7);
          lineMat.opacity = 1.0;
        } else {
          mat.color.setHex(baseGray);
          mat.emissive.setHex(isHovered ? (isDark ? 0x38BDF8 : 0x0284C7) : 0x000000);
          mat.emissiveIntensity = isHovered ? (isDark ? 0.25 : 0.15) : 0;
          const hScale = 0.65;
          mesh.scale.y = hScale;
          const topY = cDepth * hScale;
          border.position.y = topY + 0.008;
          lineMat.color.setHex(isHovered ? 0xFFFFFF : (isDark ? 0x475569 : 0xA8A29E));
          lineMat.opacity = isHovered ? 1.0 : 0.7;
        }
      }
    });

    // 2. Update All Official Barangay Polygons (Both Vulnerable & Non-Vulnerable)
    const showHotspotsLayer =
      curLayerFilter === 'all' || curLayerFilter === 'hotspots';

    barangayMeshesRef.current.forEach(({ bgy, group, meshes, borders, baseDepth: bgyDepth }) => {
      const isFocusCityBgy =
        (curActiveDisease === 'dengue' && normalizeCityName(bgy.city) === 'quezon city') ||
        (curActiveDisease === 'lepto' && normalizeCityName(bgy.city) === 'manila');

      const isInspectedCityBgy = Boolean(
        curInspectedCity && normalizeCityName(curInspectedCity.name) === normalizeCityName(bgy.city)
      );

      // A barangay is active if it belongs to the focus city OR currently inspected city
      const isCityActive = isFocusCityBgy || isInspectedCityBgy;
      const isActionFocused =
        curFocusedAction !== null &&
        (bgy.actionCodes.includes(curFocusedAction) ||
          bgy.id === curFocusedAction ||
          bgy.name === curFocusedAction);

      const isVisible = Boolean(
        isCityActive && (curCityGridEnabled || (bgy.isVulnerable && showHotspotsLayer) || isActionFocused)
      );

      group.visible = isVisible;
      if (!isVisible) return;

      let parentTopY = baseDepth * 0.65;
      if (isFocusCityBgy) {
        parentTopY = activeFocusTopY;
      } else if (isInspectedCityBgy) {
        parentTopY = baseDepth * 1.25;
      }
      group.position.y = parentTopY + 0.008;

      const isHovered = hoveredKeyRef.current === `barangay:${bgy.id}`;
      const renderAsVulnerable = bgy.isVulnerable && showHotspotsLayer;

      let fillHex = 0x1E293B;
      let emissiveHex = 0x000000;
      let emissiveInt = 0.08;
      let borderHex = 0xFFFFFF;
      let borderOp = 0.85;
      let scaleY = 1.0;

      if (renderAsVulnerable) {
        if (bgy.level === 3) {
          fillHex = isHovered ? 0xFB923C : (isDark ? 0xF97316 : 0xEA580C);
          emissiveHex = 0xF97316;
          borderHex = isHovered || isActionFocused ? 0xFFFFFF : 0xFED7AA;
          scaleY = 2.85;
        } else if (bgy.level === 2) {
          fillHex = isHovered ? 0xFACC15 : (isDark ? 0xEAB308 : 0xD97706);
          emissiveHex = 0xF59E0B;
          borderHex = isHovered || isActionFocused ? 0xFFFFFF : 0xFEF08A;
          scaleY = 2.15;
        } else {
          fillHex = isHovered ? 0x34D399 : (isDark ? 0x10B981 : 0x059669);
          emissiveHex = 0x10B981;
          borderHex = isHovered || isActionFocused ? 0xFFFFFF : 0xA7F3D0;
          scaleY = 1.65;
        }
        scaleY =
          scaleY *
          (isHovered ? 1.35 : 1.0) *
          (isActionFocused ? 1.28 : 1.0) *
          Math.max(0.85, rainBoost * 0.95);
        emissiveInt = isHovered ? 0.68 : isActionFocused ? 0.55 : isDark ? 0.36 : 0.24;
        borderOp = 1.0;
      } else {
        // Non-Vulnerable Baseline Barangay — distinct boundary outlines + full hover lift & glow!
        if (bgy.city === 'Quezon City') {
          const baseShade = isDark
            ? DENGUE_BGY_DARK_SHADES[bgy.shade % 4]
            : DENGUE_BGY_LIGHT_SHADES[bgy.shade % 4];
          fillHex = isHovered ? (isDark ? 0xF43F5E : 0xFB7185) : baseShade;
          emissiveHex = 0xFB7185;
          emissiveInt = isHovered ? 0.52 : (isDark ? 0.12 : 0.06);
          borderHex = isHovered ? 0xFFFFFF : (isDark ? 0xFFE4E6 : 0xFFF1F2);
          borderOp = isHovered ? 1.0 : 0.78;
        } else if (bgy.city === 'City of Manila') {
          const baseShade = isDark
            ? LEPTO_BGY_DARK_SHADES[bgy.shade % 4]
            : LEPTO_BGY_LIGHT_SHADES[bgy.shade % 4];
          fillHex = isHovered ? (isDark ? 0x14B8A6 : 0x2DD4BF) : baseShade;
          emissiveHex = 0x2DD4BF;
          emissiveInt = isHovered ? 0.52 : (isDark ? 0.14 : 0.06);
          borderHex = isHovered ? 0xFFFFFF : (isDark ? 0xCCFBF1 : 0xF0FDFA);
          borderOp = isHovered ? 1.0 : 0.82;
        } else {
          const baseShade = isDark
            ? INSPECTED_BGY_DARK_SHADES[bgy.shade % 4]
            : INSPECTED_BGY_LIGHT_SHADES[bgy.shade % 4];
          fillHex = isHovered ? (isDark ? 0x475569 : 0xE2E8F0) : baseShade;
          emissiveHex = 0x38BDF8;
          emissiveInt = isHovered ? 0.45 : (isDark ? 0.14 : 0.06);
          borderHex = isHovered ? 0xFFFFFF : (isDark ? 0x7DD3FC : 0x0284C7);
          borderOp = isHovered ? 1.0 : 0.78;
        }
        scaleY = isHovered ? 2.4 : 1.0;
      }

      const topOffset = bgyDepth * scaleY + 0.005;
      for (let i = 0; i < meshes.length; i++) {
        const m = meshes[i];
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.color.setHex(fillHex);
        mat.emissive.setHex(emissiveHex);
        mat.emissiveIntensity = emissiveInt;
        m.scale.y = scaleY;
      }
      for (let i = 0; i < borders.length; i++) {
        const b = borders[i];
        const bMat = b.material as THREE.LineBasicMaterial;
        bMat.color.setHex(borderHex);
        bMat.opacity = borderOp;
        b.position.y = topOffset + (isHovered ? 0.008 : 0);
      }
    });

    // 3. Update Health Facility 3D Nodes
    facilityMeshesRef.current.forEach(({ facility, group, pillarMesh, ringMesh }) => {
      const isFocusCityFacility =
        (curActiveDisease === 'dengue' && normalizeCityName(facility.city) === 'quezon city') ||
        (curActiveDisease === 'lepto' && normalizeCityName(facility.city) === 'manila');
      const isInspectedCityFacility = Boolean(
        curInspectedCity && normalizeCityName(curInspectedCity.name) === normalizeCityName(facility.city)
      );

      let layerMatches = false;
      if (curLayerFilter === 'all') layerMatches = true;
      else if (curLayerFilter === 'hospitals' && facility.type === 'hospital') layerMatches = true;
      else if (curLayerFilter === 'clinics' && facility.type === 'health_center') layerMatches = true;

      const isTargetCity = isFocusCityFacility || isInspectedCityFacility;
      const isActionFocused =
        curFocusedAction !== null &&
        (facility.actionCodes.includes(curFocusedAction) ||
          facility.id === curFocusedAction ||
          facility.name === curFocusedAction);

      const isVisible = Boolean(
        isActionFocused ||
        (curLayerFilter !== 'off' && isTargetCity && layerMatches)
      );

      group.visible = isVisible;
      if (!isVisible) return;

      let cityTopY = baseDepth * 0.65;
      if (isFocusCityFacility) {
        cityTopY = activeFocusTopY;
      } else if (isInspectedCityFacility) {
        cityTopY = baseDepth * 1.25;
      }

      group.position.y = cityTopY + 0.065;

      const isHovered = hoveredKeyRef.current === `facility:${facility.id}`;
      const pillarMat = pillarMesh.material as THREE.MeshStandardMaterial;
      const ringMat = ringMesh.material as THREE.MeshBasicMaterial;

      if (facility.type === 'hospital') {
        pillarMat.color.setHex(isHovered || isActionFocused ? 0xFFFFFF : isDark ? 0x38BDF8 : 0x0284C7);
        pillarMat.emissive.setHex(0x0284C7);
        pillarMat.emissiveIntensity = isHovered || isActionFocused ? 0.75 : 0.4;
        ringMat.color.setHex(isHovered || isActionFocused ? 0xFFFFFF : 0x7DD3FC);
      } else {
        pillarMat.color.setHex(isHovered || isActionFocused ? 0xFFFFFF : isDark ? 0x34D399 : 0x059669);
        pillarMat.emissive.setHex(0x10B981);
        pillarMat.emissiveIntensity = isHovered || isActionFocused ? 0.75 : 0.4;
        ringMat.color.setHex(isHovered || isActionFocused ? 0xFFFFFF : 0x6EE7B7);
      }

      const s = isHovered ? 1.45 : isActionFocused ? 1.3 : 1.0;
      group.scale.set(s, s, s);
    });

    // 4. Elevate Rivers Group dynamically above active/inspected city & barangay terrain
    if (riversGroupRef.current) {
      riversGroupRef.current.position.y = activeFocusTopY + 0.056;
    }
  }, [
    activeDisease,
    rainfallIntensity,
    theme,
    inspectedCity,
    effectiveLayerFilter,
    focusedActionCode,
    cityGridEnabled
  ]);

  const syncCityAppearanceRef = useRef(syncCityAppearance);
  syncCityAppearanceRef.current = syncCityAppearance;

  useEffect(() => {
    syncCityAppearance();
  }, [
    activeDisease,
    inspectedCity,
    rainfallIntensity,
    theme,
    effectiveLayerFilter,
    focusedActionCode,
    cityGridEnabled,
    syncCityAppearance
  ]);

  // Seamless theme transition for Three.js scene background, fog, and lights
  useEffect(() => {
    if (!sceneRef.current) return;
    const isDark = theme === 'dark';
    const scene = sceneRef.current;
    const targetBg = new THREE.Color(isDark ? 0x070E14 : 0xF7F4EE);
    scene.background = targetBg;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color = targetBg;
    }
    const { hemiLight, dirLight, waterMat, rainMat, riverOuterMat, riverCoreMat } = lightsRef.current;
    if (hemiLight) {
      hemiLight.groundColor.setHex(isDark ? 0x0F172A : 0xD6CEC3);
      hemiLight.intensity = isDark ? 1.35 : 1.7;
    }
    if (dirLight) {
      dirLight.intensity = isDark ? 1.35 : 1.15;
    }
    if (waterMat) {
      waterMat.color.setHex(isDark ? 0x070E14 : 0xF1EDE4);
    }
    if (rainMat) {
      rainMat.color.setHex(isDark ? 0x7DD3FC : 0x0284C7);
    }
    if (riverOuterMat) {
      riverOuterMat.color.setHex(isDark ? 0x0D9488 : 0x0284C7);
    }
    if (riverCoreMat) {
      riverCoreMat.color.setHex(isDark ? 0x7DD3FC : 0x38BDF8);
    }
  }, [theme]);

  // Main Three.js Scene Initialization
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const isDark = theme === 'dark';

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDark ? 0x070E14 : 0xF7F4EE);
    scene.fog = new THREE.FogExp2(isDark ? 0x070E14 : 0xF7F4EE, 0.015);

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.2,
      120
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = false;

    // Fast Lighting
    const hemiLight = new THREE.HemisphereLight(
      0xFFFFFF,
      isDark ? 0x0F172A : 0xD6CEC3,
      isDark ? 1.35 : 1.7
    );
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, isDark ? 1.35 : 1.15);
    dirLight.position.set(12, 24, 14);
    scene.add(dirLight);

    // Ground Plane + Grid
    const waterGeo = new THREE.PlaneGeometry(80, 80);
    const waterMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x070E14 : 0xF1EDE4
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -0.02;
    scene.add(waterMesh);

    const gridHelper = new THREE.GridHelper(
      60,
      90,
      isDark ? 0x1E293B : 0xE4DED4,
      isDark ? 0x0F1A24 : 0xECE6DC
    );
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 1. Extrude the 17 Metro Manila Cities
    const citiesGroup = new THREE.Group();
    const bordersGroup = new THREE.Group();
    scene.add(citiesGroup);
    scene.add(bordersGroup);

    const createdMeshes: typeof cityMeshesRef.current = [];
    const baseDepth = 0.22;

    METRO_MANILA_CITIES.forEach(city => {
      city.rings.forEach(ring => {
        if (ring.length < 3) return;

        const shape = new THREE.Shape();
        const ring3D: [number, number][] = [];
        ring.forEach(([lon, lat], idx) => {
          const [x, z] = ncrGeoTo3D(lon, lat);
          ring3D.push([x, z]);
          if (idx === 0) shape.moveTo(x, -z);
          else shape.lineTo(x, -z);
        });
        shape.closePath();

        const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
          depth: baseDepth,
          bevelEnabled: false
        });
        extrudeGeo.rotateX(-Math.PI / 2);

        const mat = new THREE.MeshStandardMaterial({
          color: 0x1E293B,
          roughness: 0.45,
          metalness: 0.12,
          flatShading: true
        });

        const mesh = new THREE.Mesh(extrudeGeo, mat);
        mesh.userData = { kind: 'city', city };
        citiesGroup.add(mesh);

        const borderPts = ring3D.map(([x, z]) => new THREE.Vector3(x, 0, z));
        const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPts);
        const borderMat = new THREE.LineBasicMaterial({
          color: 0x64748B,
          transparent: true,
          opacity: 0.8
        });
        const borderLine = new THREE.LineLoop(borderGeo, borderMat);
        bordersGroup.add(borderLine);

        createdMeshes.push({
          city,
          mesh,
          border: borderLine,
          baseDepth
        });
      });
    });

    cityMeshesRef.current = createdMeshes;

    // 2. Build Official PSA Barangay / District 3D Polygons + Outlines (Both Vulnerable & Non-Vulnerable)
    const barangaysRoot = new THREE.Group();
    scene.add(barangaysRoot);
    const interactiveOverlayMeshes: THREE.Object3D[] = [];
    const createdBarangays: typeof barangayMeshesRef.current = [];
    const bgyBaseDepth = 0.044;

    NCR_BARANGAYS.forEach(bgy => {
      const group = new THREE.Group();
      const meshes: THREE.Mesh[] = [];
      const borders: THREE.LineLoop[] = [];

      const mat = new THREE.MeshStandardMaterial({
        color: 0x9F1239,
        roughness: 0.35,
        metalness: 0.14,
        flatShading: true
      });

      const borderMat = new THREE.LineBasicMaterial({
        color: 0xFFE4E6,
        transparent: true,
        opacity: 0.85
      });

      bgy.rings.forEach(ring => {
        if (ring.length < 3) return;
        const shape = new THREE.Shape();
        const pts3D: [number, number][] = [];

        ring.forEach(([lon, lat], idx) => {
          const [x, z] = ncrGeoTo3D(lon, lat);
          pts3D.push([x, z]);
          if (idx === 0) shape.moveTo(x, -z);
          else shape.lineTo(x, -z);
        });
        shape.closePath();

        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: bgyBaseDepth,
          bevelEnabled: false
        });
        geo.rotateX(-Math.PI / 2);

        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { kind: 'barangay', bgy };
        group.add(mesh);
        meshes.push(mesh);
        interactiveOverlayMeshes.push(mesh);

        const borderVectors = pts3D.map(([x, z]) => new THREE.Vector3(x, 0, z));
        const borderGeo = new THREE.BufferGeometry().setFromPoints(borderVectors);
        const border = new THREE.LineLoop(borderGeo, borderMat);
        group.add(border);
        borders.push(border);
      });

      if (meshes.length > 0) {
        barangaysRoot.add(group);
        createdBarangays.push({
          bgy,
          group,
          meshes,
          borders,
          baseDepth: bgyBaseDepth
        });
      }
    });

    barangayMeshesRef.current = createdBarangays;

    // 3. Build 3D Health Facility Markers
    const facilitiesRoot = new THREE.Group();
    scene.add(facilitiesRoot);
    const createdFacilities: typeof facilityMeshesRef.current = [];

    const hospPillarGeo = new THREE.BoxGeometry(0.11, 0.34, 0.11);
    hospPillarGeo.translate(0, 0.17, 0);
    const clinicDiamondGeo = new THREE.OctahedronGeometry(0.11, 0);
    clinicDiamondGeo.translate(0, 0.16, 0);
    const ringGeo = new THREE.RingGeometry(0.09, 0.15, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const hitBoxGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.42, 8);
    hitBoxGeo.translate(0, 0.21, 0);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });

    // Pre-compute 3D positions and apply automatic spatial de-collision so nearby hospitals never overlap
    const facilityPositions3D = HEALTH_FACILITIES.map(f => {
      const [fx, fz] = ncrGeoTo3D(f.coords[0], f.coords[1]);
      return { x: fx, z: fz };
    });
    const minMarkerSpacing = 0.38;
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < facilityPositions3D.length; i++) {
        for (let j = i + 1; j < facilityPositions3D.length; j++) {
          const dx = facilityPositions3D[j].x - facilityPositions3D[i].x;
          const dz = facilityPositions3D[j].z - facilityPositions3D[i].z;
          const dist = Math.hypot(dx, dz);
          if (dist < minMarkerSpacing) {
            const push = (minMarkerSpacing - dist) * 0.52;
            const ux = dist > 0.0001 ? dx / dist : 1;
            const uz = dist > 0.0001 ? dz / dist : 0;
            facilityPositions3D[i].x -= ux * push;
            facilityPositions3D[i].z -= uz * push;
            facilityPositions3D[j].x += ux * push;
            facilityPositions3D[j].z += uz * push;
          }
        }
      }
    }

    HEALTH_FACILITIES.forEach((facility, idx) => {
      const { x: fx, z: fz } = facilityPositions3D[idx];
      const group = new THREE.Group();
      group.position.set(fx, 0.3, fz);

      const pillarMat = new THREE.MeshStandardMaterial({
        color: facility.type === 'hospital' ? 0x38BDF8 : 0x34D399,
        roughness: 0.25,
        metalness: 0.2
      });

      const pillarMesh = new THREE.Mesh(
        facility.type === 'hospital' ? hospPillarGeo : clinicDiamondGeo,
        pillarMat
      );
      group.add(pillarMesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: facility.type === 'hospital' ? 0x7DD3FC : 0x6EE7B7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.005;
      group.add(ringMesh);

      const hitMesh = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitMesh.userData = { kind: 'facility', facility };
      group.add(hitMesh);
      interactiveOverlayMeshes.push(hitMesh);

      facilitiesRoot.add(group);
      createdFacilities.push({ facility, group, pillarMesh, ringMesh, hitMesh });
    });

    facilityMeshesRef.current = createdFacilities;

    // 4. Rivers (Dual-Channel Luminous Hydro-Vectors elevated above terrain)
    const riversGroup = new THREE.Group();
    riversGroup.visible = riversEnabledRef.current;
    riversGroupRef.current = riversGroup;
    scene.add(riversGroup);

    const riverOuterMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x0D9488 : 0x0284C7,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    });
    const riverCoreMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x7DD3FC : 0x38BDF8,
      transparent: true,
      opacity: 0.95
    });

    METRO_MANILA_RIVERS.forEach(river => {
      const pts = river.points.map(([lon, lat]) => {
        const [x, z] = ncrGeoTo3D(lon, lat);
        return new THREE.Vector3(x, 0, z);
      });
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.35);
      const isMajorChannel = river.name === 'Pasig River' || river.name === 'Marikina River';
      const coreRadius = isMajorChannel ? 0.034 : 0.024;
      const outerRadius = isMajorChannel ? 0.068 : 0.048;

      const outerGeo = new THREE.TubeGeometry(curve, 44, outerRadius, 6, false);
      outerGeo.scale(1, 0.32, 1);
      const outerMesh = new THREE.Mesh(outerGeo, riverOuterMat);
      outerMesh.renderOrder = 4;
      riversGroup.add(outerMesh);

      const coreGeo = new THREE.TubeGeometry(curve, 44, coreRadius, 6, false);
      coreGeo.scale(1, 0.45, 1);
      const coreMesh = new THREE.Mesh(coreGeo, riverCoreMat);
      coreMesh.position.y = 0.006;
      coreMesh.renderOrder = 5;
      riversGroup.add(coreMesh);
    });

    syncCityAppearance();

    // 5. Rain Particles
    const rainCount = 320;
    const rainPos = new Float32Array(rainCount * 3);
    const rainVel = new Float32Array(rainCount);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 24;
      rainPos[i * 3 + 1] = Math.random() * 16;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 24;
      rainVel[i] = 0.18 + Math.random() * 0.14;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: isDark ? 0x7DD3FC : 0x0284C7,
      size: 0.075,
      transparent: true,
      opacity: 0.5
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    scene.add(rainPoints);

    lightsRef.current = { hemiLight, dirLight, waterMat, rainMat, riverOuterMat, riverCoreMat };

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (pausedRef.current) return;

      const o = orbitRef.current;
      o.currentTheta += (o.theta - o.currentTheta) * 0.12;
      o.currentPhi += (o.phi - o.currentPhi) * 0.12;
      o.currentRadius += (o.radius - o.currentRadius) * 0.12;

      const t = cameraTargetRef.current;
      t.currentLookAt.lerp(t.lookAt, 0.12);

      const cx = t.currentLookAt.x + o.currentRadius * Math.sin(o.currentPhi) * Math.sin(o.currentTheta);
      const cy = t.currentLookAt.y + o.currentRadius * Math.cos(o.currentPhi);
      const cz = t.currentLookAt.z + o.currentRadius * Math.sin(o.currentPhi) * Math.cos(o.currentTheta);

      camera.position.set(cx, cy, cz);
      camera.lookAt(t.currentLookAt);

      rainPoints.visible = rainEnabledRef.current;
      if (rainEnabledRef.current) {
        const arr = rainGeo.attributes.position.array as Float32Array;
        const mult = Math.max(0.35, rainfallRef.current / 400);
        for (let i = 0; i < rainCount; i++) {
          arr[i * 3 + 1] -= rainVel[i] * mult;
          if (arr[i * 3 + 1] < 0) {
            arr[i * 3 + 1] = 15;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      }

      riversGroup.visible = riversEnabledRef.current;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let isRightDrag = false;
    let dragDist = 0;
    let prevX = 0;
    let prevY = 0;
    let lastRaycastTime = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      isRightDrag = e.button === 2 || e.shiftKey;
      dragDist = 0;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (pausedRef.current) return;

      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        dragDist += Math.hypot(dx, dy);
        prevX = e.clientX;
        prevY = e.clientY;

        if (isRightDrag) {
          const panSpeed = orbitRef.current.radius * 0.0012;
          cameraTargetRef.current.lookAt.x -= dx * panSpeed;
          cameraTargetRef.current.lookAt.z -= dy * panSpeed;
        } else {
          orbitRef.current.theta -= dx * 0.0055;
          orbitRef.current.phi = Math.max(
            0.08,
            Math.min(Math.PI / 2 - 0.08, orbitRef.current.phi - dy * 0.0055)
          );
        }
        return;
      }

      if (e.target !== canvas) {
        if (hoveredKeyRef.current !== null) {
          hoveredKeyRef.current = null;
          canvas.style.cursor = 'grab';
          setHoveredEntity(null);
          syncCityAppearanceRef.current();
        }
        return;
      }

      if (tooltipElRef.current) {
        tooltipElRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY - 14}px, 0) translate(-50%, -100%)`;
      }

      const now = performance.now();
      if (now - lastRaycastTime < 24) return;
      lastRaycastTime = now;

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const activeOverlays = interactiveOverlayMeshes.filter(obj => obj.parent?.visible);
      const overlayHits = raycaster.intersectObjects(activeOverlays, false);

      if (overlayHits.length > 0) {
        // Prioritize 3D Health Facility hits if cursor is directly over a facility marker
        const facilityHit = overlayHits.find(h => h.object.userData?.kind === 'facility');
        const chosenHit = facilityHit || overlayHits[0];
        const ud = chosenHit.object.userData;

        if (ud?.kind === 'facility' && ud.facility) {
          const f = ud.facility as HealthFacilityNode;
          const key = `facility:${f.id}`;
          canvas.style.cursor = 'pointer';
          if (hoveredKeyRef.current !== key) {
            hoveredKeyRef.current = key;
            setHoveredEntity({ kind: 'facility', data: f });
            syncCityAppearanceRef.current();
          }
          return;
        }
        if (ud?.kind === 'barangay' && ud.bgy) {
          const bgy = ud.bgy as NCRBarangayPolygon;
          const key = `barangay:${bgy.id}`;
          canvas.style.cursor = 'pointer';
          if (hoveredKeyRef.current !== key) {
            hoveredKeyRef.current = key;
            setHoveredEntity({ kind: 'barangay', data: bgy });
            syncCityAppearanceRef.current();
          }
          return;
        }
      }

      const cityHits = raycaster.intersectObjects(citiesGroup.children, false);
      if (cityHits.length > 0) {
        const hitCity = cityHits[0].object.userData?.city as NCRCityPolygon | undefined;
        if (hitCity) {
          const key = `city:${hitCity.name}`;
          canvas.style.cursor = 'pointer';
          if (hoveredKeyRef.current !== key) {
            hoveredKeyRef.current = key;
            setHoveredEntity({ kind: 'city', data: hitCity });
            syncCityAppearanceRef.current();
          }
          return;
        }
      }

      if (hoveredKeyRef.current !== null) {
        hoveredKeyRef.current = null;
        canvas.style.cursor = 'grab';
        setHoveredEntity(null);
        syncCityAppearanceRef.current();
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      isRightDrag = false;
    };

    const onClick = (e: MouseEvent) => {
      if (dragDist > 6) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const activeOverlays = interactiveOverlayMeshes.filter(obj => obj.parent?.visible);
      const overlayHits = raycaster.intersectObjects(activeOverlays, false);
      if (overlayHits.length > 0) {
        const facilityHit = overlayHits.find(h => h.object.userData?.kind === 'facility');
        const chosenHit = facilityHit || overlayHits[0];
        const ud = chosenHit.object.userData;

        if (ud?.kind === 'facility' && ud.facility) {
          const f = ud.facility as HealthFacilityNode;
          const [fx, fz] = ncrGeoTo3D(f.coords[0], f.coords[1]);
          cameraTargetRef.current.lookAt.set(fx, 0.3, fz);
          orbitRef.current.radius = Math.min(orbitRef.current.radius, 6.2);
          return;
        }
        if (ud?.kind === 'barangay' && ud.bgy) {
          const bgy = ud.bgy as NCRBarangayPolygon;
          const [bx, bz] = ncrGeoTo3D(bgy.centroid[0], bgy.centroid[1]);
          cameraTargetRef.current.lookAt.set(bx, 0.3, bz);
          orbitRef.current.radius = Math.min(orbitRef.current.radius, 6.8);
          const parentCity = METRO_MANILA_CITIES.find(
            c => normalizeCityName(c.name) === normalizeCityName(bgy.city)
          );
          if (parentCity && onInspectCityRef.current) {
            onInspectCityRef.current(parentCity);
          }
          return;
        }
      }

      const intersects = raycaster.intersectObjects(citiesGroup.children, false);
      if (intersects.length > 0) {
        const hitCity = intersects[0].object.userData?.city as NCRCityPolygon | undefined;
        if (hitCity) {
          if (onInspectCityRef.current) onInspectCityRef.current(hitCity);
          if (hitCity.focusId && onSelectCityRef.current) {
            onSelectCityRef.current(hitCity.focusId);
            const [cx, cz] = ncrGeoTo3D(hitCity.centroid[0], hitCity.centroid[1]);
            cameraTargetRef.current.lookAt.set(cx, 0.2, cz);
            orbitRef.current.radius = hitCity.focusId === 'dengue' ? 10.5 : 6.8;
          } else {
            const [cx, cz] = ncrGeoTo3D(hitCity.centroid[0], hitCity.centroid[1]);
            cameraTargetRef.current.lookAt.set(cx, 0.15, cz);
            orbitRef.current.radius = Math.min(orbitRef.current.radius, 9.5);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(
        4.2,
        Math.min(32.0, orbitRef.current.radius + e.deltaY * 0.012)
      );
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      renderer.dispose();
      sceneRef.current = null;
      lightsRef.current = {};
    };
  }, []);

  const isDark = theme === 'dark';

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-grab" />

      {/* Streamlined Unified Command Bar Dock */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-2xl shadow-2xl pointer-events-auto transition-colors max-w-[calc(100vw-32px)] border ${
          isDark
            ? 'bg-slate-900/90 text-white border-slate-700/80 shadow-black/50'
            : 'bg-[#FFFDF9]/95 text-stone-800 border-[#E7E1D6] shadow-stone-300/40'
        }`}
      >
        {/* Focus Cities */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              hoveredKeyRef.current = null;
              setHoveredEntity(null);
              const qc = METRO_MANILA_CITIES.find(c => c.focusId === 'dengue') || null;
              if (onInspectCity) onInspectCity(qc);
              onSelectCity('dengue');
              setCameraView('qc');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeDisease === 'dengue'
                ? 'bg-rose-600 text-white shadow-md'
                : isDark
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>QC (Dengue)</span>
          </button>

          <button
            onClick={() => {
              hoveredKeyRef.current = null;
              setHoveredEntity(null);
              const mnl = METRO_MANILA_CITIES.find(c => c.focusId === 'lepto') || null;
              if (onInspectCity) onInspectCity(mnl);
              onSelectCity('lepto');
              setCameraView('manila');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeDisease === 'lepto'
                ? isDark
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-[#0F766E] text-white shadow-md'
                : isDark
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Manila (Lepto)</span>
          </button>
        </div>

        <div className={`h-4 w-px mx-1 ${isDark ? 'bg-slate-700' : 'bg-[#E7E1D6]'}`} />

        {/* Action Layer Filters */}
        <div className="hidden sm:flex items-center gap-1">
          {(
            [
              { id: 'all', label: 'All Layers', dot: 'bg-amber-400' },
              { id: 'hotspots', label: 'Hotspots (5)', dot: 'bg-orange-500' },
              { id: 'hospitals', label: 'Hospitals', dot: 'bg-sky-400' },
              { id: 'clinics', label: 'Health Ctrs', dot: 'bg-emerald-400' },
              { id: 'off', label: 'Hide', dot: 'bg-slate-400' }
            ] as const
          ).map(tab => {
            const active = effectiveLayerFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setLayerFilter(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                  active
                    ? isDark
                      ? 'bg-slate-700 text-white border border-slate-500/60 shadow-sm'
                      : 'bg-stone-900 text-white shadow-sm'
                    : isDark
                      ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className={`h-4 w-px mx-1 ${isDark ? 'bg-slate-700' : 'bg-[#E7E1D6]'}`} />

        {/* Map Views & Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCityGridEnabled(!cityGridEnabled)}
            title="Toggle barangay boundary outlines"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
              cityGridEnabled
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                : isDark
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-stone-500 hover:bg-[#F3EFE6]'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span className="hidden md:inline">Barangays: {cityGridEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            onClick={() => {
              hoveredKeyRef.current = null;
              setHoveredEntity(null);
              if (onInspectCity) onInspectCity(null);
              setCameraView('ncr');
            }}
            title="Full Metro Manila Overview"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Full NCR</span>
          </button>

          <button
            onClick={() => setCameraView('top')}
            title="Top-Down Map View"
            className={`p-1.5 rounded-xl transition ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={() => setRiversEnabled(!riversEnabled)}
            title="Toggle Rivers"
            className={`p-1.5 rounded-xl transition ${
              riversEnabled
                ? isDark
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'bg-[#EBF3F8] text-[#0369A1]'
                : isDark
                  ? 'text-slate-500 hover:bg-slate-800'
                  : 'text-stone-400 hover:bg-[#F3EFE6]'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setRainEnabled(!rainEnabled)}
            title="Toggle Rainfall"
            className={`p-1.5 rounded-xl transition ${
              rainEnabled
                ? isDark
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'bg-[#EBF3F8] text-[#0369A1]'
                : isDark
                  ? 'text-slate-500 hover:bg-slate-800'
                  : 'text-stone-400 hover:bg-[#F3EFE6]'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>

          {focusedActionCode && onClearFocusedAction && (
            <button
              onClick={onClearFocusedAction}
              className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-xl text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
            >
              <span>[{focusedActionCode}]</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Direct-DOM Tooltip for Cities, All Barangays (Vulnerable & Non-Vulnerable), and Health Facilities */}
      <div
        ref={tooltipElRef}
        className={`fixed top-0 left-0 z-50 pointer-events-none transition-opacity duration-75 ${
          hoveredEntity ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        {hoveredEntity && (
          <div
            className={`px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl min-w-[250px] max-w-[310px] border transition-colors ${
              isDark
                ? 'bg-slate-950/95 text-white border-slate-700/90'
                : 'bg-[#FFFDF9]/95 text-stone-900 border-[#E7E1D6] shadow-stone-300/50'
            }`}
          >
            {hoveredEntity.kind === 'barangay' && (
              <>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      hoveredEntity.data.isVulnerable
                        ? 'text-amber-500'
                        : isDark
                          ? 'text-slate-400'
                          : 'text-stone-500'
                    }`}
                  >
                    {hoveredEntity.data.isVulnerable ? 'Vulnerable Barangay' : 'Official Barangay'} ·{' '}
                    {hoveredEntity.data.city}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      hoveredEntity.data.isVulnerable
                        ? hoveredEntity.data.level === 3
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : hoveredEntity.data.level === 2
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-[#F4EFE6] text-stone-700 border-[#E7E1D6]'
                    }`}
                  >
                    {hoveredEntity.data.isVulnerable
                      ? `${hoveredEntity.data.risk} Risk`
                      : 'Baseline · Non-Hotspot'}
                  </span>
                </div>
                <div className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {hoveredEntity.data.name}
                </div>
                <p className={`mt-1 text-[11px] leading-snug ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                  {hoveredEntity.data.desc}
                </p>
                <div
                  className={`mt-2 pt-2 border-t text-[11px] ${
                    hoveredEntity.data.isVulnerable
                      ? isDark
                        ? 'border-slate-800 text-amber-300'
                        : 'border-[#F0EBE1] text-amber-900'
                      : isDark
                        ? 'border-slate-800 text-slate-300'
                        : 'border-[#F0EBE1] text-stone-700'
                  }`}
                >
                  <span className="font-bold">
                    {hoveredEntity.data.isVulnerable && hoveredEntity.data.actionCodes.length > 0
                      ? `Action Protocol [${hoveredEntity.data.actionCodes.join(', ')}]: `
                      : 'Surveillance: '}
                  </span>
                  {hoveredEntity.data.actionSummary}
                </div>
              </>
            )}

            {hoveredEntity.kind === 'facility' && (
              <>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      hoveredEntity.data.type === 'hospital' ? 'text-sky-400' : 'text-emerald-400'
                    }`}
                  >
                    {hoveredEntity.data.type === 'hospital' ? 'Referral Hospital' : 'Health & Staging Hub'}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isDark
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-[#F4EFE6] text-stone-800 border-[#E7E1D6]'
                    }`}
                  >
                    {hoveredEntity.data.city}
                  </span>
                </div>
                <div className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {hoveredEntity.data.name}
                </div>
                <div className={`text-[10px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  {hoveredEntity.data.category} · {hoveredEntity.data.address}
                </div>
                <p className={`mt-1.5 text-[11px] leading-snug ${isDark ? 'text-slate-200' : 'text-stone-700'}`}>
                  {hoveredEntity.data.role}
                </p>
                <div
                  className={`mt-2 pt-1.5 border-t text-[10px] font-bold ${
                    isDark ? 'border-slate-800 text-sky-300' : 'border-[#F0EBE1] text-sky-800'
                  }`}
                >
                  Action Plan Codes: [{hoveredEntity.data.actionCodes.join(', ')}] · Click to zoom
                </div>
              </>
            )}

            {hoveredEntity.kind === 'city' && (
              <>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-stone-500'
                    }`}
                  >
                    {hoveredEntity.data.district}
                  </span>
                  {hoveredEntity.data.isFocus ? (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        hoveredEntity.data.focusId === 'dengue'
                          ? isDark
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                          : isDark
                            ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {hoveredEntity.data.focusId === 'dengue' ? 'Dengue Data' : 'Leptospirosis Data'}
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isDark
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-[#F4EFE6] text-stone-700 border border-[#E7E1D6]'
                      }`}
                    >
                      Click to Reveal Grid &amp; Hospital
                    </span>
                  )}
                </div>

                <div className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {hoveredEntity.data.name}
                </div>

                <div
                  className={`mt-2 pt-2 border-t space-y-1 text-[11px] ${
                    isDark ? 'border-slate-800' : 'border-[#F0EBE1]'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Land Area:</span>
                    <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
                      {hoveredEntity.data.areaKm2} km²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-stone-500'}>Population:</span>
                    <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
                      {hoveredEntity.data.population}
                    </span>
                  </div>
                  <div className={`pt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                    <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>Basin: </span>
                    {hoveredEntity.data.riverBasin}
                  </div>
                </div>

                <div
                  className={`mt-2 pt-1.5 border-t text-[10px] font-semibold ${
                    isDark ? 'border-slate-800/80 text-sky-400' : 'border-[#F0EBE1] text-stone-700'
                  }`}
                >
                  {hoveredEntity.data.isFocus
                    ? 'Click to focus city, barangay grids & 10 facilities →'
                    : 'Click to highlight city grid & reveal referral hospital →'}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
