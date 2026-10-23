import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  METRO_MANILA_CITIES,
  METRO_MANILA_RIVERS,
  ncrGeoTo3D,
  NCRCityPolygon
} from './metroManilaData';
import {
  CloudRain,
  Compass,
  Grid,
  Waves
} from 'lucide-react';

export interface Philippines3DMapProps {
  activeDisease: 'dengue' | 'lepto';
  onSelectCity: (disease: 'dengue' | 'lepto') => void;
  onInspectCity?: (city: NCRCityPolygon | null) => void;
  inspectedCity?: NCRCityPolygon | null;
  rainfallIntensity?: number; // 0 to 1200 mm
  predictedCases?: number;
  theme?: 'light' | 'dark';
}

const DARK_GRAY_SHADES = [0x1E293B, 0x1E293B, 0x243244, 0x2C3B4E];
const LIGHT_GRAY_SHADES = [0xDBD4C8, 0xE2DCD2, 0xE9E3DA, 0xEDE8E1];

export const Philippines3DMap: React.FC<Philippines3DMapProps> = ({
  activeDisease,
  onSelectCity,
  onInspectCity,
  inspectedCity,
  rainfallIntensity = 430,
  predictedCases = 270,
  theme = 'dark'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipElRef = useRef<HTMLDivElement>(null);

  const [hoveredCity, setHoveredCity] = useState<NCRCityPolygon | null>(null);
  const [rainEnabled, setRainEnabled] = useState(true);
  const [riversEnabled, setRiversEnabled] = useState(false);

  const cityMeshesRef = useRef<{
    city: NCRCityPolygon;
    mesh: THREE.Mesh;
    border: THREE.LineLoop;
    baseDepth: number;
  }[]>([]);

  const hoveredCityNameRef = useRef<string | null>(null);
  const activeDiseaseRef = useRef<'dengue' | 'lepto'>(activeDisease);
  activeDiseaseRef.current = activeDisease;

  const rainEnabledRef = useRef<boolean>(rainEnabled);
  rainEnabledRef.current = rainEnabled;
  const riversEnabledRef = useRef<boolean>(riversEnabled);
  riversEnabledRef.current = riversEnabled;
  const rainfallRef = useRef<number>(rainfallIntensity);
  rainfallRef.current = rainfallIntensity;

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
      orbitRef.current.phi = 0.68;
      orbitRef.current.radius = 11.2;
      cameraTargetRef.current.lookAt.set(qx, 0.2, qz);
    } else if (preset === 'manila') {
      const [mx, mz] = ncrGeoTo3D(120.985, 14.602);
      orbitRef.current.theta = 0.08;
      orbitRef.current.phi = 0.65;
      orbitRef.current.radius = 7.8;
      cameraTargetRef.current.lookAt.set(mx, 0.2, mz);
    } else if (preset === 'top') {
      const [cx, cz] = ncrGeoTo3D(121.03, 14.615);
      orbitRef.current.theta = 0;
      orbitRef.current.phi = 0.06;
      orbitRef.current.radius = 19.5;
      cameraTargetRef.current.lookAt.set(cx, 0, cz);
    }
  }, []);

  // Update colors & elevation of the 17 cities reactively
  const syncCityAppearance = useCallback(() => {
    const isDark = theme === 'dark';
    const rainBoost = Math.max(0.7, Math.min(1.8, rainfallIntensity / 380));

    cityMeshesRef.current.forEach(({ city, mesh, border, baseDepth }) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const lineMat = border.material as THREE.LineBasicMaterial;
      const isHovered = hoveredCityNameRef.current === city.name;
      const isInspected = inspectedCity?.name === city.name;

      if (city.focusId === 'dengue') {
        // Quezon City (Dengue Outbreak Scope: Rose/Crimson)
        const isActive = activeDisease === 'dengue';
        mat.color.setHex(isActive ? 0xE11D48 : (isDark ? 0x9F1239 : 0xBE123C));
        mat.emissive.setHex(0xE11D48);
        mat.emissiveIntensity = isHovered ? (isDark ? 0.45 : 0.28) : isActive ? (isDark ? 0.24 : 0.12) : 0.04;
        const hScale = (isActive ? 1.45 * rainBoost : 1.0) + (isHovered ? 0.25 : 0);
        mesh.scale.y = hScale;
        border.position.y = baseDepth * hScale + 0.012;
        lineMat.color.setHex(isHovered ? (isDark ? 0xFFFFFF : 0x881337) : (isDark ? 0xFDA4AF : 0xE11D48));
        lineMat.opacity = 1.0;
      } else if (city.focusId === 'lepto') {
        // City of Manila (Leptospirosis Outbreak Scope: Deep Tidal Teal/Marine)
        const isActive = activeDisease === 'lepto';
        mat.color.setHex(isActive ? (isDark ? 0x0D9488 : 0x0F766E) : (isDark ? 0x115E59 : 0x134E4A));
        mat.emissive.setHex(isDark ? 0x14B8A6 : 0x0D9488);
        mat.emissiveIntensity = isHovered ? (isDark ? 0.45 : 0.25) : isActive ? (isDark ? 0.26 : 0.12) : 0.04;
        const hScale = (isActive ? 1.45 * rainBoost : 1.0) + (isHovered ? 0.25 : 0);
        mesh.scale.y = hScale;
        border.position.y = baseDepth * hScale + 0.012;
        lineMat.color.setHex(isHovered ? (isDark ? 0xFFFFFF : 0x0F172A) : (isDark ? 0x5EEAD4 : 0x0F766E));
        lineMat.opacity = 1.0;
      } else {
        // Other 15 Metro Manila Cities: Architectural Grayscale
        const baseGray = isDark
          ? DARK_GRAY_SHADES[city.grayShade] || 0x1E293B
          : LIGHT_GRAY_SHADES[city.grayShade] || 0xE2DCD2;

        if (isHovered || isInspected) {
          mat.color.setHex(isDark ? 0x475569 : 0xB8ADA1);
          mat.emissive.setHex(isDark ? 0x38BDF8 : 0x0284C7);
          mat.emissiveIntensity = isDark ? 0.22 : 0.12;
          mesh.scale.y = 0.85;
          border.position.y = baseDepth * 0.85 + 0.012;
          lineMat.color.setHex(isDark ? 0x7DD3FC : 0x1C1917);
          lineMat.opacity = 1.0;
        } else {
          mat.color.setHex(baseGray);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mesh.scale.y = 0.65;
          border.position.y = baseDepth * 0.65 + 0.008;
          lineMat.color.setHex(isDark ? 0x475569 : 0xA8A29E);
          lineMat.opacity = 0.7;
        }
      }
    });
  }, [activeDisease, rainfallIntensity, theme, inspectedCity]);

  useEffect(() => {
    syncCityAppearance();
  }, [syncCityAppearance]);

  // Main Three.js Scene Initialization
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const isDark = theme === 'dark';

    const scene = new THREE.Scene();
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

    // Ground Plane + Grid (Warm Linen & Sand in Light Mode)
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

    // Extrude the 17 Metro Manila Cities
    const citiesGroup = new THREE.Group();
    const bordersGroup = new THREE.Group();
    scene.add(citiesGroup);
    scene.add(bordersGroup);

    const createdMeshes: {
      city: NCRCityPolygon;
      mesh: THREE.Mesh;
      border: THREE.LineLoop;
      baseDepth: number;
    }[] = [];

    const baseDepth = 0.22;

    METRO_MANILA_CITIES.forEach(city => {
      city.rings.forEach(ring => {
        if (ring.length < 3) return;

        // In 2D Three.js Shape: X = x, Y = -z
        const shape = new THREE.Shape();
        ring.forEach(([lon, lat], idx) => {
          const [x, z] = ncrGeoTo3D(lon, lat);
          if (idx === 0) shape.moveTo(x, -z);
          else shape.lineTo(x, -z);
        });
        shape.closePath();

        // Extrude along +Z_shape by baseDepth without beveling (clean geographic boundaries)
        const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
          depth: baseDepth,
          bevelEnabled: false
        });

        // Rotate by -Math.PI / 2 around X:
        // x' = x
        // y' = z_shape (extrusion height! Goes from 0 up to +baseDepth)
        // z' = -y_shape = -(-z) = +z (EXACT MATCH to ncrGeoTo3D z!)
        extrudeGeo.rotateX(-Math.PI / 2);

        const mat = new THREE.MeshStandardMaterial({
          color: 0x1E293B,
          roughness: 0.45,
          metalness: 0.12,
          flatShading: true
        });

        const mesh = new THREE.Mesh(extrudeGeo, mat);
        mesh.userData = { city };
        citiesGroup.add(mesh);

        // Top Perimeter Border Line (Exact match: x, baseDepth, z)
        const borderPts = ring.map(([lon, lat]) => {
          const [x, z] = ncrGeoTo3D(lon, lat);
          return new THREE.Vector3(x, 0, z);
        });
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
    syncCityAppearance();

    // Rivers (Pasig, Marikina, San Juan, Tullahan) — Toggleable
    const riversGroup = new THREE.Group();
    riversGroup.visible = riversEnabledRef.current;
    scene.add(riversGroup);

    METRO_MANILA_RIVERS.forEach(river => {
      const pts = river.points.map(([lon, lat]) => {
        const [x, z] = ncrGeoTo3D(lon, lat);
        return new THREE.Vector3(x, baseDepth + 0.03, z);
      });
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.04, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: isDark ? 0x38BDF8 : 0x0284C7,
        transparent: true,
        opacity: 0.8
      });
      riversGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
    });

    // Rain Particles
    const rainCount = 360;
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

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

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

    // Fast Raycasting against ONLY the 17 city meshes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let isRightDrag = false;
    let dragDist = 0;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      isRightDrag = e.button === 2 || e.shiftKey;
      dragDist = 0;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
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

      // Update tooltip DOM coordinates directly without React state re-render
      if (tooltipElRef.current) {
        tooltipElRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY - 14}px, 0) translate(-50%, -100%)`;
      }

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(citiesGroup.children);

      if (intersects.length > 0) {
        const hitCity = intersects[0].object.userData?.city as NCRCityPolygon | undefined;
        if (hitCity) {
          canvas.style.cursor = 'pointer';
          if (hoveredCityNameRef.current !== hitCity.name) {
            hoveredCityNameRef.current = hitCity.name;
            setHoveredCity(hitCity);
            syncCityAppearance();
          }
          return;
        }
      }

      if (hoveredCityNameRef.current !== null) {
        hoveredCityNameRef.current = null;
        canvas.style.cursor = 'grab';
        setHoveredCity(null);
        syncCityAppearance();
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
      const intersects = raycaster.intersectObjects(citiesGroup.children);
      if (intersects.length > 0) {
        const hitCity = intersects[0].object.userData?.city as NCRCityPolygon | undefined;
        if (hitCity) {
          if (onInspectCity) onInspectCity(hitCity);
          if (hitCity.focusId) {
            onSelectCity(hitCity.focusId);
            const [cx, cz] = ncrGeoTo3D(hitCity.centroid[0], hitCity.centroid[1]);
            cameraTargetRef.current.lookAt.set(cx, 0.15, cz);
            orbitRef.current.radius = hitCity.focusId === 'dengue' ? 11.2 : 7.8;
          } else {
            const [cx, cz] = ncrGeoTo3D(hitCity.centroid[0], hitCity.centroid[1]);
            cameraTargetRef.current.lookAt.set(cx, 0.1, cz);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(
        5.0,
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
    };
  }, [theme]);

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-grab" />

      {/* Bottom-Center Floating Map Camera & City Focus Bar */}
      <div className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-xl shadow-2xl pointer-events-auto transition-colors ${
        theme === 'dark'
          ? 'bg-slate-900/90 text-white border border-slate-700/80 shadow-black/40'
          : 'bg-[#FFFDF9]/95 text-stone-800 border border-[#E7E1D6] shadow-stone-300/40'
      }`}>
        <button
          onClick={() => {
            onSelectCity('dengue');
            setCameraView('qc');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeDisease === 'dengue'
              ? 'bg-rose-600 text-white shadow-md'
              : theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
          Quezon City (Dengue)
        </button>

        <button
          onClick={() => {
            onSelectCity('lepto');
            setCameraView('manila');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeDisease === 'lepto'
              ? (theme === 'dark' ? 'bg-teal-600 text-white shadow-md' : 'bg-[#0F766E] text-white shadow-md')
              : theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${theme === 'dark' ? 'bg-teal-300' : 'bg-emerald-300'}`} />
          City of Manila (Leptospirosis)
        </button>

        <div className={`h-4 w-px mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-[#E7E1D6]'}`} />

        <button
          onClick={() => setCameraView('ncr')}
          title="Reset to Full Metro Manila (All 17 LGUs)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
            theme === 'dark'
              ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
              : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-stone-600 dark:text-sky-400" />
          <span>Full Metro Manila</span>
        </button>

        <button
          onClick={() => setCameraView('top')}
          title="Top-Down 2D Map Perspective"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
            theme === 'dark'
              ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
              : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
          }`}
        >
          <Grid className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Top-Down</span>
        </button>

        <button
          onClick={() => setRiversEnabled(!riversEnabled)}
          title={riversEnabled ? 'Hide River Waterways' : 'Show Major River Waterways (Pasig / Marikina / San Juan)'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
            riversEnabled
              ? theme === 'dark'
                ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'bg-[#EBF3F8] text-[#0369A1] border border-[#BAE0F5] shadow-sm'
              : theme === 'dark'
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-stone-700 hover:bg-[#F3EFE6] hover:text-stone-900'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span>{riversEnabled ? 'Rivers: On' : 'Rivers: Off'}</span>
        </button>

        <button
          onClick={() => setRainEnabled(!rainEnabled)}
          title="Toggle rainfall animation"
          className={`p-1.5 rounded-xl transition ${
            rainEnabled
              ? theme === 'dark' ? 'bg-sky-500/20 text-sky-300' : 'bg-[#EBF3F8] text-[#0369A1]'
              : theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-stone-400 hover:bg-[#F3EFE6]'
          }`}
        >
          <CloudRain className="w-4 h-4" />
        </button>
      </div>

      {/* Direct-DOM Tooltip */}
      <div
        ref={tooltipElRef}
        className={`fixed top-0 left-0 z-50 pointer-events-none transition-opacity duration-75 ${
          hoveredCity ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        {hoveredCity && (
          <div className={`px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl min-w-[240px] max-w-[290px] border transition-colors ${
            theme === 'dark'
              ? 'bg-slate-950/95 text-white border-slate-700/90'
              : 'bg-[#FFFDF9]/95 text-stone-900 border-[#E7E1D6] shadow-stone-300/50'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-stone-500'}`}>
                {hoveredCity.district}
              </span>
              {hoveredCity.isFocus ? (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    hoveredCity.focusId === 'dengue'
                      ? theme === 'dark'
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                      : theme === 'dark'
                        ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {hoveredCity.focusId === 'dengue' ? 'Dengue Data' : 'Leptospirosis Data'}
                </span>
              ) : (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-[#F4EFE6] text-stone-700 border border-[#E7E1D6]'
                }`}>
                  Grayscale · Out of Scope
                </span>
              )}
            </div>

            <div className={`text-base font-extrabold ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
              {hoveredCity.name}
            </div>

            <div className={`mt-2 pt-2 border-t space-y-1 text-[11px] ${theme === 'dark' ? 'border-slate-800' : 'border-[#F0EBE1]'}`}>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-stone-500'}>Land Area:</span>
                <span className={`font-mono font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-stone-800'}`}>{hoveredCity.areaKm2} km²</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-stone-500'}>Population:</span>
                <span className={`font-mono font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-stone-800'}`}>{hoveredCity.population}</span>
              </div>
              <div className={`pt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-stone-500'}`}>
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-stone-700'}`}>Basin: </span>
                {hoveredCity.riverBasin}
              </div>
            </div>

            <div className={`mt-2 pt-1.5 border-t text-[10px] font-semibold ${
              theme === 'dark' ? 'border-slate-800/80 text-sky-400' : 'border-[#F0EBE1] text-stone-700'
            }`}>
              {hoveredCity.isFocus
                ? 'Click to select city & view live nowcast →'
                : 'Click to inspect city details or upload local CSV →'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
