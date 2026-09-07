import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Campus3DScene: React.FC<{
  onRotateInfo?: () => void;
}> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 340;
    let height = container.clientHeight || 220;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(4.8, 3.8, 6.2);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lighting
    const ambient = new THREE.AmbientLight(0xffeedd, 0.95);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xff9933, 1.8);
    mainLight.position.set(5, 8, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueRim = new THREE.DirectionalLight(0x38bdf8, 0.7);
    blueRim.position.set(-5, 4, -4);
    scene.add(blueRim);

    const pointWarm = new THREE.PointLight(0xf97316, 2.4, 8);
    pointWarm.position.set(0.5, 1.2, 1);
    scene.add(pointWarm);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Materials
    const matGround = new THREE.MeshLambertMaterial({ color: 0x1f1b18 });
    const matHostel = new THREE.MeshLambertMaterial({ color: 0x3d352e });
    const matLitWin = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const matDarkWin = new THREE.MeshLambertMaterial({ color: 0x181412 });
    const matStairs = new THREE.MeshLambertMaterial({ color: 0xea580c });
    const matDeliveryBox = new THREE.MeshLambertMaterial({ color: 0xf97316 });
    const matBagHandle = new THREE.MeshLambertMaterial({ color: 0xc2410c });
    const matGate = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const matCoin = new THREE.MeshLambertMaterial({ color: 0xfbbf24 });
    const matRunner = new THREE.MeshLambertMaterial({ color: 0xffedd5 });
    const matHoodie = new THREE.MeshLambertMaterial({ color: 0xe11d48 });

    // Base Quad Platform
    const groundGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.3, 32);
    const ground = new THREE.Mesh(groundGeo, matGround);
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    rootGroup.add(ground);

    // College Hostel Block (Aryabhatta Wing B)
    const bldgGeo = new THREE.BoxGeometry(2.2, 3.0, 1.6);
    const hostelBldg = new THREE.Mesh(bldgGeo, matHostel);
    hostelBldg.position.set(-1.1, 1.5, -0.6);
    hostelBldg.castShadow = true;
    hostelBldg.receiveShadow = true;
    rootGroup.add(hostelBldg);

    // Windows with midnight exam cram lights
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        const winGeo = new THREE.BoxGeometry(0.32, 0.42, 0.05);
        const isCramming = (r === 0 && c === 1) || (r === 1 && c === 0) || (r === 2 && c === 1);
        const win = new THREE.Mesh(winGeo, isCramming ? matLitWin : matDarkWin);
        win.position.set(-1.5 + c * 0.8, 0.65 + r * 0.85, 0.23);
        rootGroup.add(win);
      }
    }

    // Winding Hostel Stairwell Flights
    const stairSteps = 7;
    for (let i = 0; i < stairSteps; i++) {
      const stepGeo = new THREE.BoxGeometry(0.85, 0.14, 0.35);
      const step = new THREE.Mesh(stepGeo, matStairs);
      step.position.set(0.15 + (i * 0.18), 0.14 * (stairSteps - i), -0.2 + (i * 0.32));
      step.receiveShadow = true;
      rootGroup.add(step);
    }

    // Campus Curfew Turnstile & Security Barrier
    const gatePole1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.2, 0.14), matGate);
    gatePole1.position.set(1.1, 0.6, 1.7);
    const gatePole2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.2, 0.14), matGate);
    gatePole2.position.set(2.2, 0.6, 1.7);
    rootGroup.add(gatePole1);
    rootGroup.add(gatePole2);

    const barrierBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.08, 0.06),
      new THREE.MeshLambertMaterial({ color: 0xef4444 })
    );
    barrierBar.position.set(1.65, 0.85, 1.7);
    rootGroup.add(barrierBar);

    // Floating Late-Night Delivery Parcel
    const foodParcelGroup = new THREE.Group();
    const parcelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 0.55), matDeliveryBox);
    parcelMesh.castShadow = true;
    foodParcelGroup.add(parcelMesh);

    const bagHandle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 8, 16, Math.PI), matBagHandle);
    bagHandle.rotation.x = Math.PI;
    bagHandle.position.y = 0.38;
    foodParcelGroup.add(bagHandle);

    const receipt = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.25), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    receipt.position.set(0, 0.05, 0.28);
    foodParcelGroup.add(receipt);

    foodParcelGroup.position.set(1.7, 1.2, 0.5);
    rootGroup.add(foodParcelGroup);

    // Floating Golden Rupee Coin
    const coinGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 24);
    const rupeeCoin = new THREE.Mesh(coinGeo, matCoin);
    rupeeCoin.rotation.z = Math.PI / 3;
    rupeeCoin.position.set(1.9, 1.95, 0.2);
    rootGroup.add(rupeeCoin);

    // Hostel Peer Runner walking up/down stairs
    const runnerGroup = new THREE.Group();
    const runnerHead = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), matRunner);
    runnerHead.position.y = 0.38;
    const runnerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.32, 12), matHoodie);
    runnerBody.position.y = 0.16;
    runnerGroup.add(runnerHead);
    runnerGroup.add(runnerBody);
    runnerGroup.position.set(0.15, 0.9, 0.1);
    rootGroup.add(runnerGroup);

    // Interactive orbital drag controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0.4;
    let targetRotationX = 0.15;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotationY += deltaX * 0.008;
        targetRotationX = Math.max(-0.25, Math.min(0.35, targetRotationX + deltaY * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          targetRotationY += normX * 0.002;
          targetRotationX = Math.max(-0.2, Math.min(0.3, targetRotationX + normY * 0.001));
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Bobbing food parcel
      foodParcelGroup.position.y = 1.2 + Math.sin(t * 2.4) * 0.1;
      foodParcelGroup.rotation.y = Math.sin(t * 1.5) * 0.2;

      // Spinning rupee coin
      rupeeCoin.rotation.y = t * 2.2;
      rupeeCoin.position.y = 1.95 + Math.cos(t * 2.2) * 0.08;

      // Student runner stair movement cycle
      const cycle = (t * 1.25) % stairSteps;
      const currentStep = Math.floor(cycle);
      const stepFrac = cycle - currentStep;
      const startY = 0.14 * (stairSteps - currentStep);
      const endY = 0.14 * (stairSteps - (currentStep + 1));
      runnerGroup.position.y = THREE.MathUtils.lerp(startY, endY, stepFrac) + Math.abs(Math.sin(stepFrac * Math.PI)) * 0.08;
      runnerGroup.position.x = 0.15 + (cycle * 0.18);
      runnerGroup.position.z = -0.2 + (cycle * 0.32);

      // Smooth camera sway + interactive mouse parallax
      rootGroup.rotation.y += (targetRotationY + Math.sin(t * 0.3) * 0.08 - rootGroup.rotation.y) * 0.05;
      rootGroup.rotation.x += (targetRotationX * 0.2 - rootGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

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
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="threejs-campus-viewport"
      className="w-full h-56 rounded-2xl overflow-hidden shadow-inner bg-[#181412] relative cursor-grab active:cursor-grabbing"
    />
  );
};
