import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  ChevronRight,
  Sparkles,
  MapPin,
  Building,
  DoorOpen,
  Coffee,
  CheckCircle2,
  ShieldCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface CampusFlythroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStage?: number;
}

interface Waypoint {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  cameraPos: [number, number, number];
  lookAtPos: [number, number, number];
}

const WAYPOINTS: Waypoint[] = [
  {
    id: 0,
    title: 'Campus Exterior & Gate 1',
    subtitle: 'Commercial Dropoff Checkpoint',
    badge: 'STAGE 1: EXTERIOR',
    description:
      'Swiggy and Zomato riders arrive at the main campus barrier. Strict 10:30 PM curfew prevents external couriers from entering.',
    icon: <Building className="w-4 h-4 text-[#fea619]" />,
    progress: 0.0,
    cameraPos: [14, 10, 22],
    lookAtPos: [0, 3, 0],
  },
  {
    id: 1,
    title: 'Hostel Portico & Turnstiles',
    subtitle: 'Passing the Proctor Verification',
    badge: 'STAGE 2: PENETRATION',
    description:
      'Diving through the illuminated double glass doors of Aryabhatta Block B past biometric scanners and student turnstiles.',
    icon: <DoorOpen className="w-4 h-4 text-[#10b981]" />,
    progress: 0.33,
    cameraPos: [2.5, 2.2, 5.0],
    lookAtPos: [0, 1.8, -4],
  },
  {
    id: 2,
    title: 'Wing B 3rd Floor Corridor',
    subtitle: 'Hostel Peer Relay in Flight',
    badge: 'STAGE 3: CORRIDOR',
    description:
      'Gliding through the hostel hallway lined with midterm study rooms, sneaker racks, and the peer runner ascending with the bag.',
    icon: <MapPin className="w-4 h-4 text-[#38bdf8]" />,
    progress: 0.66,
    cameraPos: [0.3, 1.7, -10],
    lookAtPos: [0, 1.6, -22],
  },
  {
    id: 3,
    title: 'Room 304: Youth Living Sanctuary',
    subtitle: 'Doorstep Peer Handover & Escrow Release',
    badge: 'STAGE 4: YOUTH HUB',
    description:
      'Inside the late-night hosteler room with RGB lights, coding setup, and hot chai. The parcel arrives safely with instant ₹40 escrow release!',
    icon: <Coffee className="w-4 h-4 text-[#ff7849]" />,
    progress: 1.0,
    cameraPos: [-0.6, 1.8, -27],
    lookAtPos: [0.8, 1.4, -30],
  },
];

export const CampusFlythroughModal: React.FC<CampusFlythroughModalProps> = ({
  isOpen,
  onClose,
  initialStage = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState<number>(initialStage);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Audio Context for Ambient Hostel Frequency & Chimes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  // Mutable animation state references
  const animStateRef = useRef({
    progress: 0,
    targetProgress: 0,
    isPlaying: true,
    userScrubbing: false,
    speed: 0.0018,
  });

  // Sound generator
  const playHandoverChime = () => {
    if (isMuted) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0908);
    scene.fog = new THREE.FogExp2(0x0a0908, 0.025);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 200);
    camera.position.set(14, 10, 22);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ==========================================
    // 3D ENVIRONMENT ARCHITECTURE
    // ==========================================

    // --- 1. STAGE 1: EXTERIOR (Z: 5 to 25) ---
    const exteriorGroup = new THREE.Group();
    scene.add(exteriorGroup);

    // Ground tarmac & campus lawn
    const tarmacGeo = new THREE.PlaneGeometry(60, 40);
    tarmacGeo.rotateX(-Math.PI / 2);
    const tarmacMat = new THREE.MeshStandardMaterial({
      color: 0x1f1c19,
      roughness: 0.85,
    });
    const tarmac = new THREE.Mesh(tarmacGeo, tarmacMat);
    tarmac.position.set(0, 0, 15);
    tarmac.receiveShadow = true;
    exteriorGroup.add(tarmac);

    // Road markings & pedestrian crosswalk
    const zebraGeo = new THREE.PlaneGeometry(0.5, 4);
    zebraGeo.rotateX(-Math.PI / 2);
    const zebraMat = new THREE.MeshBasicMaterial({ color: 0xefebe9 });
    for (let i = -5; i <= 5; i += 1.6) {
      const zStrip = new THREE.Mesh(zebraGeo, zebraMat);
      zStrip.position.set(i, 0.02, 16);
      exteriorGroup.add(zStrip);
    }

    // Gate 1 Proctor Security Guard Post
    const boothGeo = new THREE.BoxGeometry(2.4, 2.8, 2.2);
    const boothMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.6,
    });
    const booth = new THREE.Mesh(boothGeo, boothMat);
    booth.position.set(5.5, 1.4, 14);
    booth.castShadow = true;
    exteriorGroup.add(booth);

    // Curfew Barrier Arm (Red & White striped pole)
    const barrierArmGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 16);
    barrierArmGeo.rotateZ(Math.PI / 2);
    const barrierArmMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      emissive: 0x800000,
      emissiveIntensity: 0.4,
    });
    const barrierArm = new THREE.Mesh(barrierArmGeo, barrierArmMat);
    barrierArm.position.set(2.2, 1.1, 14);
    exteriorGroup.add(barrierArm);

    // Swiggy Courier Bike parked outside gate
    const bikeGroup = new THREE.Group();
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const fWheel = new THREE.Mesh(wheelGeo, wheelMat);
    fWheel.position.set(0, 0.4, 0.8);
    const bWheel = new THREE.Mesh(wheelGeo, wheelMat);
    bWheel.position.set(0, 0.4, -0.8);
    const bikeBodyGeo = new THREE.BoxGeometry(0.5, 0.6, 1.4);
    const bikeBodyMat = new THREE.MeshStandardMaterial({ color: 0xff5722 });
    const bikeBody = new THREE.Mesh(bikeBodyGeo, bikeBodyMat);
    bikeBody.position.set(0, 0.7, 0);

    // Orange delivery thermal bag
    const delivBagGeo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
    const delivBagMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.3,
    });
    const delivBag = new THREE.Mesh(delivBagGeo, delivBagMat);
    delivBag.position.set(0, 1.15, -0.4);

    bikeGroup.add(fWheel);
    bikeGroup.add(bWheel);
    bikeGroup.add(bikeBody);
    bikeGroup.add(delivBag);
    bikeGroup.position.set(4.2, 0, 17);
    bikeGroup.rotation.y = Math.PI / 4;
    exteriorGroup.add(bikeGroup);

    // Headlight beam spotlight from delivery scooter
    const bikeLight = new THREE.SpotLight(0xfff3e0, 3, 10, Math.PI / 6, 0.5);
    bikeLight.position.set(4.2, 0.7, 17.5);
    bikeLight.target.position.set(2, 0, 20);
    exteriorGroup.add(bikeLight);
    exteriorGroup.add(bikeLight.target);

    // Campus Hostel Exterior Facade (Aryabhatta Block B)
    const facadeGeo = new THREE.BoxGeometry(26, 16, 2);
    const facadeMat = new THREE.MeshStandardMaterial({
      color: 0x2b211d,
      roughness: 0.75,
    });
    const facade = new THREE.Mesh(facadeGeo, facadeMat);
    facade.position.set(0, 8, 0);
    facade.castShadow = true;
    exteriorGroup.add(facade);

    // Entrance Portico & Glass Doors Opening
    const porticoCanopyGeo = new THREE.BoxGeometry(8, 0.5, 4);
    const porticoCanopyMat = new THREE.MeshStandardMaterial({
      color: 0xa33900,
      metalness: 0.3,
      roughness: 0.4,
    });
    const porticoCanopy = new THREE.Mesh(porticoCanopyGeo, porticoCanopyMat);
    porticoCanopy.position.set(0, 4.2, 2);
    exteriorGroup.add(porticoCanopy);

    // Portico neon signage: "ARYABHATTA RESIDENCE HALL"
    const signGeo = new THREE.BoxGeometry(5.8, 0.6, 0.1);
    const signMat = new THREE.MeshBasicMaterial({
      color: 0xffe082,
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 4.8, 2.1);
    exteriorGroup.add(signMesh);

    // Exterior Windows with warm and study blue glow
    const winGeo = new THREE.BoxGeometry(1.0, 1.2, 0.2);
    for (let floor = 1; floor < 4; floor++) {
      for (let col = -5; col <= 5; col += 2.2) {
        if (Math.abs(col) < 2.5 && floor === 1) continue; // Entrance portal
        const isLit = (col * 3 + floor * 7) % 3 === 0;
        const isBlue = (col + floor) % 4 === 0;
        const winMat = new THREE.MeshBasicMaterial({
          color: isLit ? (isBlue ? 0x38bdf8 : 0xfde047) : 0x151210,
        });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(col, floor * 3.5 + 2, 1.05);
        exteriorGroup.add(win);
      }
    }

    // Streetlamps casting warm cones on pathway
    const lamp1 = new THREE.PointLight(0xffb74d, 2.5, 12);
    lamp1.position.set(6, 4, 10);
    exteriorGroup.add(lamp1);

    const lamp2 = new THREE.PointLight(0xffb74d, 2.5, 12);
    lamp2.position.set(-6, 4, 10);
    exteriorGroup.add(lamp2);

    // --- 2. STAGE 2: ENTRANCE LOBBY & TURNSTILES (Z: -2 to -8) ---
    const lobbyGroup = new THREE.Group();
    scene.add(lobbyGroup);

    // Lobby Floor (Polished granite/marble with reflections)
    const lobbyFloorGeo = new THREE.PlaneGeometry(8, 12);
    lobbyFloorGeo.rotateX(-Math.PI / 2);
    const lobbyFloorMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e24,
      roughness: 0.25,
      metalness: 0.3,
    });
    const lobbyFloor = new THREE.Mesh(lobbyFloorGeo, lobbyFloorMat);
    lobbyFloor.position.set(0, 0, -4);
    lobbyGroup.add(lobbyFloor);

    // Lobby Ceiling with recessed warm LED strips
    const ceilingGeo = new THREE.PlaneGeometry(8, 12);
    ceilingGeo.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x181513 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, 3.8, -4);
    lobbyGroup.add(ceiling);

    // Biometric Turnstiles (Left & Right)
    const turnstileMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.2,
    });
    const turnstileGeo = new THREE.BoxGeometry(0.4, 1.0, 1.4);
    const tLeft = new THREE.Mesh(turnstileGeo, turnstileMat);
    tLeft.position.set(-1.2, 0.5, -4);
    const tCenter = new THREE.Mesh(turnstileGeo, turnstileMat);
    tCenter.position.set(0, 0.5, -4);
    const tRight = new THREE.Mesh(turnstileGeo, turnstileMat);
    tRight.position.set(1.2, 0.5, -4);
    lobbyGroup.add(tLeft);
    lobbyGroup.add(tCenter);
    lobbyGroup.add(tRight);

    // Green verification glow bars on turnstile gates
    const gateIndicatorMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const gateBarGeo = new THREE.BoxGeometry(0.1, 0.1, 0.6);
    const gBar1 = new THREE.Mesh(gateBarGeo, gateIndicatorMat);
    gBar1.position.set(-0.6, 0.9, -4);
    const gBar2 = new THREE.Mesh(gateBarGeo, gateIndicatorMat);
    gBar2.position.set(0.6, 0.9, -4);
    lobbyGroup.add(gBar1);
    lobbyGroup.add(gBar2);

    // Warden Log Desk & Courier Drop Counter
    const deskGeo = new THREE.BoxGeometry(2.6, 1.1, 1.2);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037,
      roughness: 0.6,
    });
    const wardenDesk = new THREE.Mesh(deskGeo, deskMat);
    wardenDesk.position.set(2.4, 0.55, -2);
    lobbyGroup.add(wardenDesk);

    // Digital Notice Board: "GATE 1 PARCEL PICKUP: PEER ESCROW ACTIVE"
    const boardGeo = new THREE.BoxGeometry(2.4, 1.4, 0.1);
    const boardMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const noticeBoard = new THREE.Mesh(boardGeo, boardMat);
    noticeBoard.position.set(-2.8, 2.0, -3);
    noticeBoard.rotation.y = Math.PI / 3;
    lobbyGroup.add(noticeBoard);

    // --- 3. STAGE 3: HOSTEL CORRIDOR (WING B, FLOOR 3) (Z: -8 to -24) ---
    const corridorGroup = new THREE.Group();
    scene.add(corridorGroup);

    // Long hallway floor
    const corrFloorGeo = new THREE.PlaneGeometry(3.6, 20);
    corrFloorGeo.rotateX(-Math.PI / 2);
    const corrFloorMat = new THREE.MeshStandardMaterial({
      color: 0x272422,
      roughness: 0.6,
    });
    const corrFloor = new THREE.Mesh(corrFloorGeo, corrFloorMat);
    corrFloor.position.set(0, 0, -18);
    corridorGroup.add(corrFloor);

    // Hallway Left & Right Walls
    const wallGeo = new THREE.BoxGeometry(0.2, 3.4, 20);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xefebe9,
      roughness: 0.9,
    });
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-1.8, 1.7, -18);
    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(1.8, 1.7, -18);
    corridorGroup.add(leftWall);
    corridorGroup.add(rightWall);

    // Student Hostel Room Doors (Rooms 301, 302, 303, 304, etc.)
    const doorGeo = new THREE.BoxGeometry(0.08, 2.3, 1.1);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x2b394a, // Navy hostel doors
      roughness: 0.4,
    });
    const roomDoorPositions = [
      { z: -10, side: -1, label: '301' },
      { z: -10, side: 1, label: '302' },
      { z: -15, side: -1, label: '303' },
      { z: -15, side: 1, label: '304' },
      { z: -20, side: -1, label: '305' },
      { z: -20, side: 1, label: '306' },
    ];

    roomDoorPositions.forEach((dp) => {
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(dp.side * 1.75, 1.15, dp.z);
      corridorGroup.add(door);

      // Sneaker / shoe rack outside door
      const rackGeo = new THREE.BoxGeometry(0.4, 0.4, 0.8);
      const rackMat = new THREE.MeshStandardMaterial({ color: 0x424242 });
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.set(dp.side * 1.5, 0.2, dp.z + 0.9);
      corridorGroup.add(rack);
    });

    // Fluorescent Tube Lights down the hallway
    for (let z = -9; z >= -23; z -= 4) {
      const tubeLight = new THREE.PointLight(0xfff7ed, 1.8, 7);
      tubeLight.position.set(0, 3.1, z);
      corridorGroup.add(tubeLight);

      const tubeGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8);
      tubeGeo.rotateZ(Math.PI / 2);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.position.set(0, 3.2, z);
      corridorGroup.add(tubeMesh);
    }

    // Running Hostel Peer Model with backpack in the corridor ahead!
    const runnerGroup = new THREE.Group();
    const runnerBodyGeo = new THREE.BoxGeometry(0.4, 0.7, 0.3);
    const runnerBodyMat = new THREE.MeshStandardMaterial({ color: 0xa33900 }); // Orange hoodie
    const runnerBody = new THREE.Mesh(runnerBodyGeo, runnerBodyMat);
    runnerBody.position.y = 1.1;

    const runnerHeadGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const runnerHeadMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa });
    const runnerHead = new THREE.Mesh(runnerHeadGeo, runnerHeadMat);
    runnerHead.position.y = 1.6;

    const runnerBackpackGeo = new THREE.BoxGeometry(0.35, 0.45, 0.25);
    const runnerBackpackMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
    const runnerBackpack = new THREE.Mesh(runnerBackpackGeo, runnerBackpackMat);
    runnerBackpack.position.set(0, 1.15, 0.25);

    runnerGroup.add(runnerBody);
    runnerGroup.add(runnerHead);
    runnerGroup.add(runnerBackpack);
    runnerGroup.position.set(0, 0, -18);
    corridorGroup.add(runnerGroup);

    // --- 4. STAGE 4: ROOM 304 YOUTH HUB & LIVING SANCTUARY (Z: -25 to -34) ---
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // Cozy Hostel Room Floor (Light hardwood tiles)
    const roomFloorGeo = new THREE.PlaneGeometry(6, 7);
    roomFloorGeo.rotateX(-Math.PI / 2);
    const roomFloorMat = new THREE.MeshStandardMaterial({
      color: 0x6d4c41,
      roughness: 0.6,
    });
    const roomFloor = new THREE.Mesh(roomFloorGeo, roomFloorMat);
    roomFloor.position.set(0, 0, -29);
    roomGroup.add(roomFloor);

    // Back & Side walls of Room 304
    const backWallGeo = new THREE.BoxGeometry(6, 3.4, 0.2);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0x374151, // Deep youth slate wall
      roughness: 0.8,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 1.7, -32.5);
    roomGroup.add(backWall);

    // Student Bunk Bed (Left wall)
    const bedFrameGeo = new THREE.BoxGeometry(1.6, 2.2, 2.6);
    const bedFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.5,
      roughness: 0.4,
    });
    const bedFrame = new THREE.Mesh(bedFrameGeo, bedFrameMat);
    bedFrame.position.set(-2.0, 1.1, -29);
    roomGroup.add(bedFrame);

    // Mattress & Bed Sheets (Teal / Warm Navy)
    const mattressGeo = new THREE.BoxGeometry(1.4, 0.25, 2.4);
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0x0f766e });
    const lowerMattress = new THREE.Mesh(mattressGeo, mattressMat);
    lowerMattress.position.set(-2.0, 0.6, -29);
    roomGroup.add(lowerMattress);

    // Fairy Lights hanging above the bed
    const fairyLightsGeo = new THREE.BufferGeometry();
    const fairyCount = 30;
    const fairyPos = new Float32Array(fairyCount * 3);
    for (let i = 0; i < fairyCount; i++) {
      fairyPos[i * 3] = -2.6 + Math.random() * 1.2;
      fairyPos[i * 3 + 1] = 2.0 + Math.sin(i * 0.4) * 0.3;
      fairyPos[i * 3 + 2] = -30.2 + (i / fairyCount) * 2.4;
    }
    fairyLightsGeo.setAttribute('position', new THREE.BufferAttribute(fairyPos, 3));
    const fairyMat = new THREE.PointsMaterial({
      color: 0xffd54f,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
    });
    const fairyMesh = new THREE.Points(fairyLightsGeo, fairyMat);
    roomGroup.add(fairyMesh);

    // Student Study Desk & Dual Monitors (Right wall)
    const deskTableGeo = new THREE.BoxGeometry(2.4, 0.8, 1.2);
    const deskTableMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Warm natural oak
      roughness: 0.35,
    });
    const deskTable = new THREE.Mesh(deskTableGeo, deskTableMat);
    deskTable.position.set(1.5, 0.4, -29.5);
    roomGroup.add(deskTable);

    // Laptop with glowing coding IDE screen
    const laptopBaseGeo = new THREE.BoxGeometry(0.5, 0.03, 0.35);
    const laptopMat = new THREE.MeshStandardMaterial({
      color: 0x4b5563,
      metalness: 0.8,
    });
    const laptopBase = new THREE.Mesh(laptopBaseGeo, laptopMat);
    laptopBase.position.set(1.4, 0.82, -29.5);
    roomGroup.add(laptopBase);

    // Glowing IDE screen (Emitting cyan light on student desk)
    const screenGeo = new THREE.BoxGeometry(0.48, 0.32, 0.02);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(1.4, 1.0, -29.68);
    screen.rotation.x = -Math.PI * 0.08;
    roomGroup.add(screen);

    const screenGlow = new THREE.PointLight(0x38bdf8, 2.2, 3);
    screenGlow.position.set(1.4, 1.1, -29.4);
    roomGroup.add(screenGlow);

    // Steaming Cup of Late-Night Hostel Chai
    const cupGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.14, 12);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(1.9, 0.88, -29.3);
    roomGroup.add(cup);

    // Youth Wall Poster: "HACK THE MIDTERMS"
    const posterGeo = new THREE.PlaneGeometry(1.2, 1.6);
    const posterMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
    const poster = new THREE.Mesh(posterGeo, posterMat);
    poster.position.set(1.2, 2.1, -32.39);
    roomGroup.add(poster);

    // THE PRIZE: Delivered Swiggy / Bikanervala Parcel with Floating Rupee Badge!
    const parcelGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(0.45, 0.3, 0.35);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xa33900,
      roughness: 0.3,
    });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.y = 0.15;
    parcelGroup.add(boxMesh);

    // Golden Ribbon
    const ribGeo = new THREE.BoxGeometry(0.47, 0.32, 0.08);
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.6,
    });
    const ribbon = new THREE.Mesh(ribGeo, ribMat);
    ribbon.position.y = 0.15;
    parcelGroup.add(ribbon);

    // Glowing Escrow Verified Ring above package
    const ringGeo = new THREE.RingGeometry(0.28, 0.34, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.45;
    parcelGroup.add(ringMesh);

    parcelGroup.position.set(0.9, 0.8, -29.2);
    roomGroup.add(parcelGroup);

    // Ambient Room Lighting (Warm fairy glow + RGB desk strip)
    const roomWarmLight = new THREE.PointLight(0xffedd5, 1.8, 6);
    roomWarmLight.position.set(0, 2.5, -29);
    roomGroup.add(roomWarmLight);

    const rgbDeskLight = new THREE.PointLight(0xa855f7, 2.5, 4);
    rgbDeskLight.position.set(1.5, 0.5, -29.8);
    roomGroup.add(rgbDeskLight);

    // ==========================================
    // CAMERA PATH SPLINE INTERPOLATION
    // ==========================================

    // Keyframes for Camera Positions
    const camPathPoints = [
      new THREE.Vector3(14, 10, 22),     // 0.0: High drone view of campus gate & exterior
      new THREE.Vector3(6, 4.5, 14),     // 0.18: Approaching Gate 1 barrier and bike
      new THREE.Vector3(2.5, 2.2, 5.0),   // 0.33: Portico entrance canopy
      new THREE.Vector3(0, 1.8, -1.0),    // 0.45: Piercing double glass doors into lobby
      new THREE.Vector3(0, 1.7, -6.0),    // 0.55: Passing biometric turnstiles
      new THREE.Vector3(0, 1.7, -12.0),   // 0.66: Wing B corridor flight
      new THREE.Vector3(0, 1.7, -20.0),   // 0.82: Chasing runner past room 303
      new THREE.Vector3(-0.6, 1.8, -27.0),// 0.95: Entering Room 304 threshold
      new THREE.Vector3(-0.4, 1.4, -28.2),// 1.0: Settling on student desk, laptop & delivery!
    ];

    // Keyframes for Camera Look-At Targets
    const lookPathPoints = [
      new THREE.Vector3(0, 4, 0),        // Looking at building facade
      new THREE.Vector3(4.2, 1, 16),     // Looking at Gate 1 bike & security booth
      new THREE.Vector3(0, 3, 2),        // Looking at "ARYABHATTA" sign & doors
      new THREE.Vector3(0, 1.8, -8),     // Looking down lobby through turnstiles
      new THREE.Vector3(0, 1.6, -14),    // Looking forward into hallway
      new THREE.Vector3(0, 1.5, -20),    // Looking at peer runner's backpack
      new THREE.Vector3(0, 1.4, -28),    // Looking towards Room 304 entrance
      new THREE.Vector3(1.2, 1.2, -29.5),// Looking at study desk & laptop
      new THREE.Vector3(0.9, 0.9, -29.2),// Looking directly at delivered parcel & escrow ring
    ];

    const camCurve = new THREE.CatmullRomCurve3(camPathPoints, false, 'catmullrom', 0.15);
    const lookCurve = new THREE.CatmullRomCurve3(lookPathPoints, false, 'catmullrom', 0.15);

    // Audio Drone Loop Initialization
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2 low campus hum
      gain.gain.setValueAtTime(isMuted ? 0 : 0.02, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      droneOscRef.current = osc;
      droneGainRef.current = gain;
    } catch {
      // Browser autoplay policy
    }

    // Animation Loop
    const clock = new THREE.Clock();
    let animId: number;
    let prevWaypoint = -1;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const t = clock.getElapsedTime();

      // Update progress if playing
      const state = animStateRef.current;
      if (state.isPlaying && !state.userScrubbing) {
        state.progress += state.speed;
        if (state.progress > 1.0) {
          state.progress = 0; // Loop seamlessly
        }
      }

      // Smooth progress lerp
      const currentP = Math.max(0, Math.min(1, state.progress));
      setProgress(currentP);

      // Determine active waypoint
      let activeWp = 0;
      if (currentP >= 0.85) activeWp = 3;
      else if (currentP >= 0.52) activeWp = 2;
      else if (currentP >= 0.22) activeWp = 1;
      else activeWp = 0;

      if (activeWp !== prevWaypoint) {
        prevWaypoint = activeWp;
        setCurrentWaypointIdx(activeWp);
        if (activeWp === 3) {
          playHandoverChime();
        }
      }

      // Sample 3D curves
      const currentCamPos = camCurve.getPoint(currentP);
      const currentLookAt = lookCurve.getPoint(currentP);

      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      // Procedural micro-animations
      // 1. Runner leg bounce / bobbing in corridor
      runnerGroup.position.y = Math.abs(Math.sin(t * 8)) * 0.12;
      runnerGroup.position.z = -16 - (currentP * 6); // Runs ahead as camera approaches

      // 2. Package escrow badge float and spin
      ringMesh.rotation.z = t * 1.5;
      ringMesh.position.y = 0.45 + Math.sin(t * 3) * 0.05;
      parcelGroup.rotation.y = Math.sin(t * 0.8) * 0.1;

      // 3. Fairy lights twinkle
      fairyMat.opacity = 0.7 + Math.sin(t * 4) * 0.3;

      // 4. Subtle audio drone frequency modulation based on stage
      if (droneOscRef.current && audioCtxRef.current) {
        const targetFreq = 65 + currentP * 80;
        droneOscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.2);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (droneOscRef.current) {
        droneOscRef.current.stop();
        droneOscRef.current.disconnect();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen]);

  // Audio mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (droneGainRef.current && audioCtxRef.current) {
      droneGainRef.current.gain.setTargetAtTime(
        !isMuted ? 0 : 0.02,
        audioCtxRef.current.currentTime,
        0.1
      );
    }
  };

  const handleSeek = (newProgress: number) => {
    animStateRef.current.progress = newProgress;
    setProgress(newProgress);
  };

  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    animStateRef.current.isPlaying = next;
  };

  if (!isOpen) return null;

  const currentWp = WAYPOINTS[currentWaypointIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Main 3D Cinema Frame */}
      <div
        className={`relative w-full h-full flex flex-col justify-between overflow-hidden bg-stone-950 transition-all ${
          isFullscreen ? 'p-0' : 'p-2 sm:p-6 max-w-7xl max-h-[92vh] sm:rounded-3xl border border-stone-800 shadow-2xl'
        }`}
      >
        {/* Three.js Canvas Container */}
        <div
          ref={containerRef}
          id="campus-cinematic-flythrough-canvas"
          className="absolute inset-0 w-full h-full cursor-ew-resize"
          onMouseDown={() => {
            animStateRef.current.userScrubbing = true;
          }}
          onMouseUp={() => {
            animStateRef.current.userScrubbing = false;
          }}
        />

        {/* Top Control Bar */}
        <header className="relative z-10 flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-lg text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#a33900] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-['Outfit'] text-sm sm:text-base font-bold tracking-tight text-white">
                  Campus 3D Spatial Journey
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#fea619]/20 text-[#fea619] border border-[#fea619]/30 text-[10px] font-bold">
                  {currentWp.badge}
                </span>
              </div>
              <p className="text-xs text-stone-300 hidden sm:block">
                Continuous Drone Flythrough: Exterior Gate ➔ Building Portal ➔ Corridor ➔ Youth Living Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-[#10b981]" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#a33900] hover:bg-[#c24400] text-white transition-colors cursor-pointer shadow-md"
              title="Exit 3D Flythrough"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Floating Spatial Lore Callout Card */}
        <aside className="relative z-10 max-w-md my-auto ml-2 sm:ml-4 p-4 sm:p-5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 text-white shadow-2xl animate-in slide-in-from-left duration-300">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#fea619] mb-1">
            {currentWp.icon}
            <span>{currentWp.subtitle}</span>
          </div>
          <h3 className="font-['Outfit'] text-lg sm:text-xl font-extrabold text-white mb-2">
            {currentWp.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4">
            {currentWp.description}
          </p>

          {/* Quick Waypoint Jump Pills */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
            {WAYPOINTS.map((wp, idx) => (
              <button
                key={wp.id}
                onClick={() => handleSeek(wp.progress)}
                className={`px-2.5 py-1.5 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                  currentWaypointIdx === idx
                    ? 'bg-[#a33900] text-white font-bold shadow'
                    : 'bg-white/5 hover:bg-white/10 text-stone-300'
                }`}
              >
                <span className="truncate">{wp.title.split(':')[0].replace('&', '')}</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </aside>

        {/* Bottom Interactive Scrubbing Timeline Bar */}
        <footer className="relative z-10 flex flex-col gap-3 p-3 sm:p-4 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-2xl text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="px-3.5 py-2 rounded-xl bg-[#a33900] hover:bg-[#c24400] text-white font-['Outfit'] text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause Drone' : 'Fly Continuous'}</span>
              </button>

              <button
                onClick={() => handleSeek(0)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 transition-colors cursor-pointer"
                title="Restart From Gate 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Indicators */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-stone-300">
              <span className={currentWaypointIdx === 0 ? 'text-[#fea619] font-bold' : ''}>
                1. Campus Gate
              </span>
              <span className="text-white/20">➔</span>
              <span className={currentWaypointIdx === 1 ? 'text-[#10b981] font-bold' : ''}>
                2. Building Portal
              </span>
              <span className="text-white/20">➔</span>
              <span className={currentWaypointIdx === 2 ? 'text-[#38bdf8] font-bold' : ''}>
                3. Wing B Corridor
              </span>
              <span className="text-white/20">➔</span>
              <span className={currentWaypointIdx === 3 ? 'text-[#ff7849] font-bold' : ''}>
                4. Youth Room 304
              </span>
            </div>

            <div className="text-xs font-mono text-stone-400">
              {Math.round(progress * 100)}% Traversed
            </div>
          </div>

          {/* Interactive Progress Slider */}
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#a33900]"
            />
          </div>
        </footer>
      </div>
    </div>
  );
};
