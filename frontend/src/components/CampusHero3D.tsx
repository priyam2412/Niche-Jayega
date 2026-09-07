import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  Camera,
  Moon,
  Compass,
  Volume2,
  VolumeX,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  Layers,
  Film,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CampusFlythroughModal } from './CampusFlythroughModal';

interface CampusHero3DProps {
  currentCluster: string;
  onOpenPostModal: () => void;
}

type CameraView = 'orbit' | 'gate' | 'dorm' | 'runner';
type LightingTheme = 'midnight' | 'cyber' | 'dawn';

export const CampusHero3D: React.FC<CampusHero3DProps> = ({
  currentCluster,
  onOpenPostModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [cameraView, setCameraView] = useState<CameraView>('orbit');
  const [theme, setTheme] = useState<LightingTheme>('midnight');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [runnerSpeed, setRunnerSpeed] = useState<number>(1);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isFlythroughOpen, setIsFlythroughOpen] = useState<boolean>(false);

  // References to communicate with the Three.js loop
  const sceneStateRef = useRef<{
    setCameraPreset?: (view: CameraView) => void;
    setLightingTheme?: (theme: LightingTheme) => void;
    boostRunner?: () => void;
  }>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 340;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(7.5, 6.2, 9.2);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Root groups
    const root = new THREE.Group();
    scene.add(root);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.9);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xa5b4fc, 1.4);
    moonLight.position.set(-8, 12, -6);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    scene.add(moonLight);

    const gateSpotLight = new THREE.SpotLight(0xffaa44, 3.2, 14, Math.PI / 4, 0.4, 1);
    gateSpotLight.position.set(3.8, 4.5, 3.2);
    gateSpotLight.target.position.set(3.2, 0, 2.8);
    scene.add(gateSpotLight);
    scene.add(gateSpotLight.target);

    const dormWarmPoint = new THREE.PointLight(0xf97316, 2.5, 9);
    dormWarmPoint.position.set(-2, 2.5, -0.5);
    scene.add(dormWarmPoint);

    // Materials
    const matGround = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.85,
      metalness: 0.1,
    });
    const matPathway = new THREE.MeshStandardMaterial({
      color: 0x292524,
      roughness: 0.6,
    });
    const matHostelWall = new THREE.MeshStandardMaterial({
      color: 0x3e352f,
      roughness: 0.7,
      metalness: 0.15,
    });
    const matBalcony = new THREE.MeshStandardMaterial({
      color: 0x574a41,
      roughness: 0.5,
    });
    const matLitWin = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xfde047,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    const matBlueLitWin = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    const matDarkWin = new THREE.MeshStandardMaterial({ color: 0x0c0a09 });
    const matGate = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      metalness: 0.4,
      roughness: 0.4,
    });
    const matBarrier = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.6,
    });
    const matRunnerHoodie = new THREE.MeshStandardMaterial({
      color: 0xa33900,
      roughness: 0.5,
    });
    const matRunnerSkin = new THREE.MeshStandardMaterial({ color: 0xfed7aa });
    const matBag = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.3,
    });
    const matCoin = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x855300,
      emissiveIntensity: 0.3,
    });
    const matBeaconRing = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });

    // 1. Campus Island Platform
    const islandGeo = new THREE.CylinderGeometry(6.5, 6.8, 0.4, 48);
    const island = new THREE.Mesh(islandGeo, matGround);
    island.position.y = -0.2;
    island.receiveShadow = true;
    root.add(island);

    // 2. Winding Stone Pathway from Gate 1 to Block B
    const pathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.8, 0.02, 3.2), // Gate 1
      new THREE.Vector3(2.2, 0.02, 1.8), // Campus Courtyard
      new THREE.Vector3(0.5, 0.02, 0.9), // Center fountain / garden
      new THREE.Vector3(-1.2, 0.02, 0.4), // Block B portico
      new THREE.Vector3(-1.8, 0.02, -0.4), // Entrance stairs
    ]);

    const pathPoints = pathCurve.getPoints(50);
    const pathShape = new THREE.Shape();
    pathShape.moveTo(-0.35, 0);
    pathShape.lineTo(0.35, 0);

    const pathGeo = new THREE.TubeGeometry(pathCurve, 40, 0.38, 8, false);
    const pathMesh = new THREE.Mesh(pathGeo, matPathway);
    pathMesh.scale.set(1, 0.08, 1);
    pathMesh.receiveShadow = true;
    root.add(pathMesh);

    // Glowing dotted navigation line along path
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      linewidth: 2,
      scale: 1,
      dashSize: 0.25,
      gapSize: 0.15,
    });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const navLine = new THREE.Line(lineGeo, lineMat);
    navLine.computeLineDistances();
    navLine.position.y = 0.04;
    root.add(navLine);

    // 3. College Hostel Block B (Aryabhatta)
    const dormGroup = new THREE.Group();
    dormGroup.position.set(-2.5, 0, -1.0);

    // Main tower body
    const bldgWidth = 3.6;
    const bldgHeight = 4.2;
    const bldgDepth = 2.4;
    const bldgGeo = new THREE.BoxGeometry(bldgWidth, bldgHeight, bldgDepth);
    const bldgMesh = new THREE.Mesh(bldgGeo, matHostelWall);
    bldgMesh.position.y = bldgHeight / 2;
    bldgMesh.castShadow = true;
    bldgMesh.receiveShadow = true;
    dormGroup.add(bldgMesh);

    // Architectural floor ledges / balconies
    for (let f = 1; f <= 3; f++) {
      const ledgeGeo = new THREE.BoxGeometry(bldgWidth + 0.2, 0.12, bldgDepth + 0.2);
      const ledge = new THREE.Mesh(ledgeGeo, matBalcony);
      ledge.position.y = f * 1.05;
      dormGroup.add(ledge);
    }

    // Windows with randomized late-night study lights
    const litWindows: THREE.Mesh[] = [];
    for (let floor = 0; floor < 4; floor++) {
      for (let col = 0; col < 4; col++) {
        const winGeo = new THREE.BoxGeometry(0.4, 0.45, 0.06);
        const rand = (floor * 4 + col * 7) % 10;
        let winMat = matDarkWin;
        if (rand === 1 || rand === 4 || rand === 7) winMat = matLitWin;
        else if (rand === 2 || rand === 8) winMat = matBlueLitWin;

        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(
          -1.3 + col * 0.88,
          0.6 + floor * 1.05,
          bldgDepth / 2 + 0.02
        );
        dormGroup.add(win);
        if (winMat === matLitWin || winMat === matBlueLitWin) {
          litWindows.push(win);
        }
      }
    }

    // Rooftop amenities: Water Tank & Red Aviation Antenna
    const tankGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.9, 16);
    const tank = new THREE.Mesh(tankGeo, matBalcony);
    tank.position.set(-0.8, bldgHeight + 0.45, -0.4);
    dormGroup.add(tank);

    const mastGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.4, 8);
    const mast = new THREE.Mesh(mastGeo, matGate);
    mast.position.set(1.1, bldgHeight + 0.7, 0.5);
    dormGroup.add(mast);

    const beaconGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const mastBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    mastBeacon.position.set(1.1, bldgHeight + 1.45, 0.5);
    dormGroup.add(mastBeacon);

    // Block B Entrance Portico
    const porticoGeo = new THREE.BoxGeometry(1.6, 0.16, 1.0);
    const portico = new THREE.Mesh(porticoGeo, matBalcony);
    portico.position.set(0.6, 1.0, bldgDepth / 2 + 0.5);
    dormGroup.add(portico);

    // Hostel Entrance Steps
    for (let s = 0; s < 4; s++) {
      const stepGeo = new THREE.BoxGeometry(1.4, 0.1, 0.3);
      const step = new THREE.Mesh(stepGeo, matPathway);
      step.position.set(0.6, 0.05 + s * 0.1, bldgDepth / 2 + 0.9 - s * 0.22);
      step.receiveShadow = true;
      dormGroup.add(step);
    }

    root.add(dormGroup);

    // 4. Gate 1 Curfew Barrier & Security Checkpoint
    const gateGroup = new THREE.Group();
    gateGroup.position.set(3.8, 0, 3.2);

    // Security guard cabin
    const boothGeo = new THREE.BoxGeometry(1.2, 1.8, 1.2);
    const booth = new THREE.Mesh(boothGeo, matHostelWall);
    booth.position.set(-1.0, 0.9, 0);
    booth.castShadow = true;
    gateGroup.add(booth);

    const boothRoof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 1.5), matBalcony);
    boothRoof.position.set(-1.0, 1.85, 0);
    gateGroup.add(boothRoof);

    // Gate Posts
    const postGeo = new THREE.BoxGeometry(0.18, 1.4, 0.18);
    const postLeft = new THREE.Mesh(postGeo, matGate);
    postLeft.position.set(0.2, 0.7, -0.6);
    const postRight = new THREE.Mesh(postGeo, matGate);
    postRight.position.set(0.2, 0.7, 1.2);
    gateGroup.add(postLeft);
    gateGroup.add(postRight);

    // Curfew Boom Barrier Bar
    const boomGeo = new THREE.BoxGeometry(0.1, 0.1, 1.8);
    const boomBarrier = new THREE.Mesh(boomGeo, matBarrier);
    boomBarrier.position.set(0.2, 0.9, 0.3);
    gateGroup.add(boomBarrier);

    // Delivery Moped (Scooter) parked outside Gate
    const scooterGroup = new THREE.Group();
    scooterGroup.position.set(1.4, 0, 0.4);
    scooterGroup.rotation.y = Math.PI / 4;

    const scooterBody = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 1.1), matRunnerHoodie);
    scooterBody.position.y = 0.4;
    scooterGroup.add(scooterBody);

    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const wheel1 = new THREE.Mesh(wheelGeo, wheelMat);
    wheel1.rotation.z = Math.PI / 2;
    wheel1.position.set(0, 0.18, 0.42);
    const wheel2 = wheel1.clone();
    wheel2.position.z = -0.42;
    scooterGroup.add(wheel1);
    scooterGroup.add(wheel2);

    // Moped headlight cone
    const headlight = new THREE.PointLight(0xfef08a, 1.8, 4);
    headlight.position.set(0, 0.5, 0.6);
    scooterGroup.add(headlight);

    gateGroup.add(scooterGroup);
    root.add(gateGroup);

    // 5. Animated Peer Runner Model (with backpack and delivery parcel)
    const runner = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.14, 0.2, 0.48, 12);
    const runnerTorso = new THREE.Mesh(bodyGeo, matRunnerHoodie);
    runnerTorso.position.y = 0.45;
    runner.add(runnerTorso);

    const headGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const runnerHead = new THREE.Mesh(headGeo, matRunnerSkin);
    runnerHead.position.y = 0.78;
    runner.add(runnerHead);

    // Food delivery box carried in hands
    const foodBoxGeo = new THREE.BoxGeometry(0.38, 0.32, 0.28);
    const foodBox = new THREE.Mesh(foodBoxGeo, matBag);
    foodBox.position.set(0, 0.48, 0.26);
    runner.add(foodBox);

    runner.scale.set(1.1, 1.1, 1.1);
    root.add(runner);

    // 6. Floating 3D Golden Rupee Coin
    const coinGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 32);
    const coinMesh = new THREE.Mesh(coinGeo, matCoin);
    coinMesh.position.set(0.2, 2.6, 1.0);
    coinMesh.rotation.z = Math.PI / 4;
    root.add(coinMesh);

    // 7. Holographic Waypoint Beacons (Gate 1 & Room 418)
    const beacon1 = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.55, 32), matBeaconRing);
    beacon1.rotation.x = -Math.PI / 2;
    beacon1.position.set(3.8, 0.08, 3.2);
    root.add(beacon1);

    const beacon2 = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.6, 32),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    beacon2.rotation.x = -Math.PI / 2;
    beacon2.position.set(-1.9, 0.08, 0.4);
    root.add(beacon2);

    // 8. Campus Quad Trees & Streetlamps
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const createLamp = (x: number, z: number) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.8, 8), matGate);
      pole.position.set(x, 0.9, z);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), lampMat);
      bulb.position.set(x, 1.8, z);
      const light = new THREE.PointLight(0xffedd5, 1.2, 5);
      light.position.set(x, 1.8, z);
      root.add(pole);
      root.add(bulb);
      root.add(light);
    };

    createLamp(1.8, 2.6);
    createLamp(-0.6, 1.6);
    createLamp(2.9, 0.8);

    // Trees
    const createTree = (x: number, z: number, scale = 1) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.7, 8), matPathway);
      trunk.position.set(x, 0.35, z);
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 });
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 * scale), foliageMat);
      foliage.position.set(x, 0.95 * scale, z);
      root.add(trunk);
      root.add(foliage);
    };

    createTree(1.2, -1.8, 1.2);
    createTree(-3.5, 2.4, 0.9);
    createTree(0.2, 3.8, 1.1);

    // 9. Floating Ambient Particles (Sparks & Dust Motes)
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 12;
      particlePos[i + 1] = Math.random() * 5 + 0.2;
      particlePos[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.07,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    root.add(particles);

    // Interaction & Mouse drag orbital controls
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetRotationY = 0.3;
    let targetRotationX = 0.05;
    let zoomLevel = 1.0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      targetRotationY += deltaX * 0.006;
      targetRotationX = Math.max(-0.2, Math.min(0.4, targetRotationX + deltaY * 0.004));

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomLevel = Math.max(0.65, Math.min(1.4, zoomLevel + e.deltaY * 0.001));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for drag
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        targetRotationY += deltaX * 0.008;
        targetRotationX = Math.max(-0.2, Math.min(0.4, targetRotationX + deltaY * 0.005));
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    domElem.addEventListener('touchstart', onTouchStart);
    domElem.addEventListener('touchmove', onTouchMove);

    // Camera preset handler
    let targetCameraPos = new THREE.Vector3(7.5, 6.2, 9.2);
    let targetCameraLookAt = new THREE.Vector3(0, 0.8, 0);

    const applyCameraPreset = (view: CameraView) => {
      if (view === 'orbit') {
        targetCameraPos.set(7.5, 6.2, 9.2);
        targetCameraLookAt.set(0, 0.8, 0);
      } else if (view === 'gate') {
        targetCameraPos.set(5.8, 2.5, 5.0);
        targetCameraLookAt.set(3.8, 0.6, 3.0);
      } else if (view === 'dorm') {
        targetCameraPos.set(-0.5, 4.0, 3.8);
        targetCameraLookAt.set(-2.2, 2.2, -0.6);
      } else if (view === 'runner') {
        targetCameraPos.set(3.0, 2.8, 3.2);
        targetCameraLookAt.set(0, 0.8, 0);
      }
    };

    sceneStateRef.current.setCameraPreset = applyCameraPreset;

    sceneStateRef.current.setLightingTheme = (newTheme: LightingTheme) => {
      if (newTheme === 'midnight') {
        ambientLight.color.setHex(0xffedd5);
        ambientLight.intensity = 0.9;
        moonLight.color.setHex(0xa5b4fc);
        moonLight.intensity = 1.4;
        gateSpotLight.color.setHex(0xffaa44);
      } else if (newTheme === 'cyber') {
        ambientLight.color.setHex(0x064e3b);
        ambientLight.intensity = 1.2;
        moonLight.color.setHex(0x06b6d4);
        moonLight.intensity = 2.0;
        gateSpotLight.color.setHex(0x10b981);
      } else if (newTheme === 'dawn') {
        ambientLight.color.setHex(0xfef3c7);
        ambientLight.intensity = 1.6;
        moonLight.color.setHex(0xf97316);
        moonLight.intensity = 2.2;
        gateSpotLight.color.setHex(0xfbbf24);
      }
    };

    let runnerSpeedMultiplier = 1;
    sceneStateRef.current.boostRunner = () => {
      runnerSpeedMultiplier = 2.8;
      setTimeout(() => {
        runnerSpeedMultiplier = 1;
      }, 3500);
    };

    // Animation Loop
    const clock = new THREE.Clock();
    let runnerProgress = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 1. Advance Runner along the curved path
      runnerProgress = (runnerProgress + delta * 0.16 * runnerSpeedMultiplier) % 1;
      const currentPoint = pathCurve.getPointAt(runnerProgress);
      const tangent = pathCurve.getTangentAt(runnerProgress);

      runner.position.copy(currentPoint);
      runner.position.y += Math.abs(Math.sin(elapsed * 9 * runnerSpeedMultiplier)) * 0.08; // jogging bob
      runner.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

      // 2. Spinning Golden Rupee Coin
      coinMesh.rotation.y = elapsed * 2.4;
      coinMesh.position.y = 2.6 + Math.sin(elapsed * 2.5) * 0.18;

      // 3. Pulsing Beacon Rings
      const s1 = 1 + Math.sin(elapsed * 4) * 0.15;
      beacon1.scale.set(s1, s1, s1);
      const s2 = 1 + Math.cos(elapsed * 4) * 0.15;
      beacon2.scale.set(s2, s2, s2);

      // 4. Rooftop beacon blink
      const blink = Math.sin(elapsed * 6) > 0 ? 1 : 0.2;
      mastBeacon.scale.set(blink, blink, blink);

      // 5. Flickering dorm windows
      if (Math.random() < 0.04 && litWindows.length > 0) {
        const win = litWindows[Math.floor(Math.random() * litWindows.length)];
        win.scale.y = 0.9 + Math.random() * 0.2;
      }

      // 6. Slowly float ambient sparks
      const posArray = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posArray[i] += delta * 0.25;
        if (posArray[i] > 6) posArray[i] = 0.2;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 7. Smoothly interpolate root rotation & camera position
      root.rotation.y += (targetRotationY - root.rotation.y) * 0.05;
      root.rotation.x += (targetRotationX - root.rotation.x) * 0.05;

      camera.position.lerp(targetCameraPos.clone().multiplyScalar(zoomLevel), 0.04);
      camera.lookAt(targetCameraLookAt);

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 0 && cr.height > 0) {
          width = cr.width;
          height = cr.height;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('touchstart', onTouchStart);
      domElem.removeEventListener('touchmove', onTouchMove);
      renderer.dispose();
      if (container.contains(domElem)) {
        container.removeChild(domElem);
      }
    };
  }, []);

  const handleCameraChange = (view: CameraView) => {
    setCameraView(view);
    sceneStateRef.current.setCameraPreset?.(view);
  };

  const handleThemeChange = (t: LightingTheme) => {
    setTheme(t);
    sceneStateRef.current.setLightingTheme?.(t);
  };

  const handleBoost = () => {
    sceneStateRef.current.boostRunner?.();
    setRunnerSpeed(2.8);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.4 } });
    setTimeout(() => setRunnerSpeed(1), 3500);
  };

  return (
    <div
      className={`w-full transition-all duration-500 relative rounded-3xl overflow-hidden shadow-md border border-[#e2bfb2]/30 ${
        isExpanded ? 'h-[460px]' : 'h-[280px] sm:h-[320px]'
      }`}
      style={{
        background:
          theme === 'cyber'
            ? 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #021a14 100%)'
            : theme === 'dawn'
            ? 'linear-gradient(135deg, #431407 0%, #291811 50%, #1c1917 100%)'
            : 'linear-gradient(135deg, #181412 0%, #221a16 50%, #15110f 100%)',
      }}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        id="campus-hero-3d-canvas"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Glass Floating Header Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
            <span className="font-['Outfit'] text-xs font-bold tracking-wide uppercase">
              3D Spatial Campus Mesh
            </span>
            <span className="text-white/40 text-xs hidden sm:inline">•</span>
            <span className="text-[11px] text-[#fea619] font-semibold hidden sm:inline">
              Gate 1 Curfew 11:30 PM
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs text-stone-200">
            <Compass className="w-3.5 h-3.5 text-[#fea619]" />
            <span>Drag to rotate • Scroll to zoom</span>
          </div>
        </div>

        {/* Right Tools: Expand, Boost, Lighting */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* 3D Cinematic Journey Trigger */}
          <button
            onClick={() => setIsFlythroughOpen(true)}
            className="px-3 py-1.5 rounded-full text-xs font-['Outfit'] font-bold flex items-center gap-1.5 backdrop-blur-md bg-gradient-to-r from-[#fea619] via-[#d97706] to-[#a33900] hover:brightness-110 text-white shadow-lg active:scale-95 cursor-pointer ring-1 ring-amber-400/40"
            title="3D Flow: Exterior Building ➔ Corridor ➔ Youth Hostel Room"
          >
            <Film className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">3D Campus Flow Tour</span>
            <span className="sm:hidden">3D Tour</span>
          </button>

          {/* Boost Sprint button */}
          <button
            onClick={handleBoost}
            className={`px-3 py-1.5 rounded-full text-xs font-['Outfit'] font-bold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95 ${
              runnerSpeed > 1
                ? 'bg-[#10b981] text-white animate-pulse'
                : 'bg-[#a33900] hover:bg-[#cc4900] text-white'
            }`}
            title="Accelerate Peer Runner Handover Simulation"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">
              {runnerSpeed > 1 ? 'Sprint Boosted 2.8x' : 'Sprint Boost'}
            </span>
          </button>

          {/* Expand / Minimize */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
            title={isExpanded ? 'Collapse 3D Stage' : 'Expand 3D Stage'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating 3D Telemetry Overlay Badges */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
        {/* Active Node */}
        <div className="px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md border border-white/10 text-white flex items-center gap-2 shadow-lg pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-[#10b981]" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
              Live Corridor Link
            </span>
            <span className="font-['Outfit'] text-xs font-bold text-white">
              Gate 1 ➔ {currentCluster} (312 & 418)
            </span>
          </div>
        </div>

        {/* Speed / Handover ETA */}
        <div className="hidden sm:flex px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md border border-white/10 text-white items-center gap-2 shadow-lg pointer-events-auto">
          <Clock className="w-3.5 h-3.5 text-[#10b981]" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
              Avg Doorstep Delivery
            </span>
            <span className="font-['Outfit'] text-xs font-bold text-emerald-400">
              6.8 mins from driver drop
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Right: Camera Angle Switcher */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 p-1 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 shadow-xl">
        <button
          onClick={() => handleCameraChange('orbit')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            cameraView === 'orbit'
              ? 'bg-[#a33900] text-white shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Campus Quad Orbit View"
        >
          🛰️ Quad
        </button>
        <button
          onClick={() => handleCameraChange('gate')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            cameraView === 'gate'
              ? 'bg-[#a33900] text-white shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Gate 1 Barrier Checkpoint"
        >
          🚧 Gate 1
        </button>
        <button
          onClick={() => handleCameraChange('dorm')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            cameraView === 'dorm'
              ? 'bg-[#a33900] text-white shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Block B Dorm View"
        >
          🏢 Block B
        </button>
        <button
          onClick={() => handleCameraChange('runner')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            cameraView === 'runner'
              ? 'bg-[#a33900] text-white shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Follow Runner Delivery Sprint"
        >
          🏃 Runner
        </button>

        {/* Lighting cycle toggle */}
        <button
          onClick={() => {
            const nextTheme: LightingTheme =
              theme === 'midnight' ? 'cyber' : theme === 'cyber' ? 'dawn' : 'midnight';
            handleThemeChange(nextTheme);
          }}
          className="p-1.5 rounded-xl hover:bg-white/15 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
          title={`Switch Lighting (Current: ${theme})`}
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3D Continuous Cinematic Flythrough Modal */}
      <CampusFlythroughModal
        isOpen={isFlythroughOpen}
        onClose={() => setIsFlythroughOpen(false)}
      />
    </div>
  );
};
