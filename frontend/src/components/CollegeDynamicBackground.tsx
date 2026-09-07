import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Layers, Eye, EyeOff } from 'lucide-react';

export type BackgroundTheme = 'campus-mesh' | 'cosmic-quad' | 'midnight-wireframe';

interface CollegeDynamicBackgroundProps {
  initialTheme?: BackgroundTheme;
}

export const CollegeDynamicBackground: React.FC<CollegeDynamicBackgroundProps> = ({
  initialTheme = 'campus-mesh',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>(initialTheme);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(false);

  const themeRef = useRef<BackgroundTheme>(currentTheme);
  themeRef.current = currentTheme;

  const isEnabledRef = useRef<boolean>(isEnabled);
  isEnabledRef.current = isEnabled;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfff8f4, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- Global Scroll & Parallax Tracker ---
    let targetScrollY = 0;
    let currentScrollY = 0;
    let scrollVelocity = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const onScroll = () => {
      targetScrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(1, Math.max(0, targetScrollY / maxScroll)));
    };

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // --- 1. Central Geodesic Wireframe Polyhedral Mesh (Like Reference Image Center) ---
    const geodesicGroup = new THREE.Group();
    scene.add(geodesicGroup);

    // Inner Icosahedron wireframe
    const innerGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xa33900,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    geodesicGroup.add(innerMesh);

    // Outer Geodesic Dodecahedron cage
    const outerGeo = new THREE.DodecahedronGeometry(3.2, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x855300,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    geodesicGroup.add(outerMesh);

    // Floating glowing core node inside the cage
    const coreGeo = new THREE.SphereGeometry(0.7, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffa07a,
      transparent: true,
      opacity: 0.65,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    geodesicGroup.add(coreMesh);

    // Position cage in right-rear quadrant to flank the campus content elegantly
    geodesicGroup.position.set(4.2, 1.0, -2.5);

    // --- 2. Concentric Orbital Particle Rings & Stream Vortex (Like Reference Image Top-Right) ---
    const orbitalRingsGroup = new THREE.Group();
    scene.add(orbitalRingsGroup);

    const createOrbitalRing = (radius: number, particleCount: number, color: number, opacity: number) => {
      const ringGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const scales = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        const theta = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.05);
        const r = radius + (Math.random() - 0.5) * 0.4;
        const x = Math.cos(theta) * r;
        const y = (Math.random() - 0.5) * 0.35;
        const z = Math.sin(theta) * r;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        scales[i] = Math.random() * 0.8 + 0.4;
      }

      ringGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      ringGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

      const ringMat = new THREE.PointsMaterial({
        color,
        size: 0.09,
        transparent: true,
        opacity,
        blending: THREE.NormalBlending,
      });

      return new THREE.Points(ringGeo, ringMat);
    };

    const ring1 = createOrbitalRing(3.6, 220, 0xa33900, 0.45);
    const ring2 = createOrbitalRing(4.8, 300, 0xd97706, 0.35);
    const ring3 = createOrbitalRing(6.0, 380, 0x059669, 0.3);
    const ring4 = createOrbitalRing(7.2, 420, 0x9333ea, 0.22);

    orbitalRingsGroup.add(ring1);
    orbitalRingsGroup.add(ring2);
    orbitalRingsGroup.add(ring3);
    orbitalRingsGroup.add(ring4);

    // Tilt the orbital vortex to match perspective
    orbitalRingsGroup.rotation.x = Math.PI * 0.28;
    orbitalRingsGroup.rotation.y = -Math.PI * 0.15;
    orbitalRingsGroup.position.set(-3.5, 2.5, -4);

    // --- 3. Academic Particle Motes & Confetti Drifting (Like Reference Image Middle-Left) ---
    const confettiCount = 140;
    const confettiGeo = new THREE.BufferGeometry();
    const confettiPos = new Float32Array(confettiCount * 3);
    const confettiVel = new Float32Array(confettiCount * 3);
    const confettiColors = new Float32Array(confettiCount * 3);

    const palette = [
      new THREE.Color(0xa33900), // Terracotta
      new THREE.Color(0xd97706), // Hostel Gold
      new THREE.Color(0x059669), // Gate Green
      new THREE.Color(0xe11d48), // Courier Red
      new THREE.Color(0x38bdf8), // Late-night Cyan
      new THREE.Color(0xfbbf24), // Rupee Gold
    ];

    for (let i = 0; i < confettiCount; i++) {
      confettiPos[i * 3] = (Math.random() - 0.5) * 26;
      confettiPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      confettiPos[i * 3 + 2] = (Math.random() - 0.5) * 14;

      confettiVel[i * 3] = (Math.random() - 0.5) * 0.006;
      confettiVel[i * 3 + 1] = Math.random() * 0.008 + 0.003; // Drift up
      confettiVel[i * 3 + 2] = (Math.random() - 0.5) * 0.006;

      const col = palette[i % palette.length];
      confettiColors[i * 3] = col.r;
      confettiColors[i * 3 + 1] = col.g;
      confettiColors[i * 3 + 2] = col.b;
    }

    confettiGeo.setAttribute('position', new THREE.BufferAttribute(confettiPos, 3));
    confettiGeo.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));

    const confettiMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
    });
    const confettiMesh = new THREE.Points(confettiGeo, confettiMat);
    scene.add(confettiMesh);

    // --- 4. Campus Topographic Isometric Mesh Ground Grid ---
    const gridCols = 32;
    const gridRows = 32;
    const gridGeo = new THREE.PlaneGeometry(36, 36, gridCols, gridRows);
    gridGeo.rotateX(-Math.PI / 2.3);

    const gridMat = new THREE.MeshBasicMaterial({
      color: 0xe2bfb2,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.position.set(0, -6.5, -6);
    scene.add(gridMesh);

    // Store original grid z for undulating wave motion
    const gridPositions = gridGeo.attributes.position;
    const origGridZ = new Float32Array(gridPositions.count);
    for (let i = 0; i < gridPositions.count; i++) {
      origGridZ[i] = gridPositions.getZ(i);
    }

    // --- 5. Subtle Floating Campus 3D Node Markers (Dorm Room Tokens & Escrow Gems) ---
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);

    const markerGeometry = new THREE.OctahedronGeometry(0.35);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0x855300,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });

    const markers: THREE.Mesh[] = [];
    const markerCoords = [
      { x: -5.5, y: 3.2, z: -3 },
      { x: 5.2, y: -2.0, z: -4 },
      { x: -4.0, y: -3.5, z: -2 },
      { x: 4.8, y: 3.8, z: -5 },
      { x: -1.2, y: 4.5, z: -4 },
    ];

    markerCoords.forEach((coord) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(coord.x, coord.y, coord.z);
      markerGroup.add(marker);
      markers.push(marker);
    });

    // --- Dynamic Lighting based on Theme ---
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.8);
    scene.add(ambientLight);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isEnabledRef.current) {
        renderer.clear();
        return;
      }

      const delta = clock.getDelta();
      const t = clock.getElapsedTime();

      // Smooth scroll interpolation with spring damping
      const scrollDiff = targetScrollY - currentScrollY;
      scrollVelocity = scrollDiff * 0.08;
      currentScrollY += scrollVelocity;

      // Mouse smoothing
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      const normalizedScroll = currentScrollY / 1200;

      // --- Theme Adjustments ---
      const theme = themeRef.current;
      if (theme === 'cosmic-quad') {
        innerMat.color.setHex(0x38bdf8);
        outerMat.color.setHex(0x6366f1);
        gridMat.color.setHex(0x818cf8);
        scene.fog?.color.setHex(0x0f172a);
      } else if (theme === 'midnight-wireframe') {
        innerMat.color.setHex(0x10b981);
        outerMat.color.setHex(0x047857);
        gridMat.color.setHex(0x34d399);
        scene.fog?.color.setHex(0x1c1917);
      } else {
        // Default Campus Mesh (Terracotta / Earthy / Gold)
        innerMat.color.setHex(0xa33900);
        outerMat.color.setHex(0x855300);
        gridMat.color.setHex(0xe2bfb2);
        scene.fog?.color.setHex(0xfff8f4);
      }

      // --- 1. Dynamic Geodesic Cage Motion (Scroll + Idle Rotation) ---
      geodesicGroup.rotation.y = t * 0.35 + normalizedScroll * 1.8;
      geodesicGroup.rotation.x = Math.sin(t * 0.4) * 0.25 + normalizedScroll * 0.9;
      geodesicGroup.rotation.z = Math.cos(t * 0.25) * 0.15;

      // Pulse core
      const corePulse = 1 + Math.sin(t * 2.5) * 0.12;
      coreMesh.scale.set(corePulse, corePulse, corePulse);

      // Cage reacts to scroll depth: sinks and shifts in 3D parallax
      geodesicGroup.position.y = 1.0 - normalizedScroll * 1.4 + Math.sin(t * 0.8) * 0.2;
      geodesicGroup.position.x = 4.2 - currentMouseX * 0.6;

      // --- 2. Concentric Orbital Rings Motion ---
      ring1.rotation.z = t * 0.45 + normalizedScroll * 2.2;
      ring2.rotation.z = -t * 0.32 - normalizedScroll * 1.8;
      ring3.rotation.z = t * 0.24 + normalizedScroll * 1.4;
      ring4.rotation.z = -t * 0.18 - normalizedScroll * 1.1;

      orbitalRingsGroup.position.y = 2.5 - normalizedScroll * 1.6 + Math.cos(t * 0.6) * 0.25;
      orbitalRingsGroup.position.x = -3.5 + currentMouseX * 0.5;

      // --- 3. Academic Confetti / Particle Motes Flow ---
      const cPositions = confettiGeo.attributes.position;
      const cArray = cPositions.array as Float32Array;

      // Scroll boosts particle upward drift!
      const upwardBoost = Math.abs(scrollVelocity) * 0.0006;

      for (let i = 0; i < confettiCount; i++) {
        // Apply velocity + scroll draft
        cArray[i * 3] += confettiVel[i * 3];
        cArray[i * 3 + 1] += confettiVel[i * 3 + 1] + upwardBoost;
        cArray[i * 3 + 2] += confettiVel[i * 3 + 2];

        // Loop if drifting too high
        if (cArray[i * 3 + 1] > 11) {
          cArray[i * 3 + 1] = -11;
          cArray[i * 3] = (Math.random() - 0.5) * 26;
        }
      }
      cPositions.needsUpdate = true;

      // --- 4. Topographic Isometric Terrain Waves ---
      const gPositions = gridGeo.attributes.position;
      for (let i = 0; i < gPositions.count; i++) {
        const u = i % (gridCols + 1);
        const v = Math.floor(i / (gridCols + 1));
        const wave = Math.sin(u * 0.35 + t * 1.2 + normalizedScroll * 3) * Math.cos(v * 0.35 + t * 0.9) * 0.45;
        gPositions.setZ(i, origGridZ[i] + wave);
      }
      gPositions.needsUpdate = true;
      gridMesh.position.y = -6.5 + normalizedScroll * 0.8;

      // --- 5. Floating Room Tokens / Octahedrons ---
      markers.forEach((m, idx) => {
        m.rotation.x = t * (0.8 + idx * 0.2);
        m.rotation.y = t * (0.6 + idx * 0.15);
        m.position.y += Math.sin(t * 1.5 + idx) * 0.003;
      });

      // --- 6. Camera Scroll & Mouse Parallax Flight ---
      // Subtle dolly zoom and pitch during scroll
      camera.position.y = -normalizedScroll * 1.2 + currentMouseY * 0.4;
      camera.position.x = currentMouseX * 0.6;
      camera.lookAt(0, -normalizedScroll * 0.6, 0);

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      {/* 3D WebGL Canvas Layer (Fixed in background behind everything) */}
      <div
        ref={containerRef}
        id="college-dynamic-canvas-bg"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700"
        style={{ opacity: isEnabled ? 1 : 0 }}
      />

      {/* Floating Aesthetic Theme & FX Controller (Bottom Left) */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        <div className="bg-white/80 backdrop-blur-md border border-[#e2bfb2]/60 rounded-full px-3 py-1.5 shadow-sm flex items-center gap-2 text-xs text-[#5a4138]">
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className="flex items-center gap-1.5 hover:text-[#a33900] transition-colors cursor-pointer"
            title={isEnabled ? 'Disable Background FX' : 'Enable Background FX'}
          >
            {isEnabled ? (
              <Eye className="w-3.5 h-3.5 text-[#006947]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-[#8e7166]" />
            )}
            <span className="font-['Outfit'] font-bold text-[11px] hidden sm:inline">
              3D Ambient FX
            </span>
          </button>

          {isEnabled && (
            <>
              <span className="w-px h-3.5 bg-[#e2bfb2]/50" />
              <button
                onClick={() => setShowControls(!showControls)}
                className="flex items-center gap-1 hover:text-[#a33900] transition-colors cursor-pointer font-semibold text-[11px]"
              >
                <Layers className="w-3 h-3 text-[#a33900]" />
                <span className="capitalize">{currentTheme.replace('-', ' ')}</span>
              </button>

              <span className="hidden sm:inline-flex text-[10px] text-[#8e7166] font-mono">
                {Math.round(scrollProgress * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Theme Picker Dropdown Popover */}
        {showControls && isEnabled && (
          <div className="absolute bottom-11 left-0 bg-white/95 backdrop-blur-xl border border-[#e2bfb2]/70 rounded-2xl p-2.5 shadow-xl flex flex-col gap-1.5 min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-2 py-1 flex items-center justify-between text-[10px] uppercase font-bold text-[#8e7166] border-b border-[#e2bfb2]/30">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#a33900]" />
                Visual Theme
              </span>
              <button
                onClick={() => setShowControls(false)}
                className="text-xs hover:text-[#1e1b18] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentTheme('campus-mesh');
                setShowControls(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                currentTheme === 'campus-mesh'
                  ? 'bg-[#faf2ed] text-[#a33900] font-bold'
                  : 'text-[#5a4138] hover:bg-[#faf2ed]'
              }`}
            >
              <span>Campus Mesh (Terracotta)</span>
              {currentTheme === 'campus-mesh' && <span className="w-1.5 h-1.5 rounded-full bg-[#a33900]" />}
            </button>

            <button
              onClick={() => {
                setCurrentTheme('cosmic-quad');
                setShowControls(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                currentTheme === 'cosmic-quad'
                  ? 'bg-[#faf2ed] text-[#6366f1] font-bold'
                  : 'text-[#5a4138] hover:bg-[#faf2ed]'
              }`}
            >
              <span>Cosmic Quad (Blue Vortex)</span>
              {currentTheme === 'cosmic-quad' && <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />}
            </button>

            <button
              onClick={() => {
                setCurrentTheme('midnight-wireframe');
                setShowControls(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                currentTheme === 'midnight-wireframe'
                  ? 'bg-[#faf2ed] text-[#059669] font-bold'
                  : 'text-[#5a4138] hover:bg-[#faf2ed]'
              }`}
            >
              <span>Midnight Curfew (Emerald)</span>
              {currentTheme === 'midnight-wireframe' && <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
