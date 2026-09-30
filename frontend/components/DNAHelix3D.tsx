"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Dna, RotateCw, ZoomIn, Hand } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DNAStructure {
  color_a?: string;
  color_b?: string;
  twist?: number;
  particle_density?: number;
}

interface DNAHelixProps {
  structure?: DNAStructure;
  themeColor?: string;
  genomeData?: {
    size?: string;
    genes?: number;
    chromosomes?: string;
    gc_content?: number;
  };
}

export default function DNAHelix3D({ structure, themeColor = "#d4af37", genomeData }: DNAHelixProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Floating ambient dust particles for sci-fi atmosphere
    const dustCount = 60;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let d = 0; d < dustCount * 3; d += 3) {
      dustPositions[d] = (Math.random() - 0.5) * 12;
      dustPositions[d + 1] = (Math.random() - 0.5) * 14;
      dustPositions[d + 2] = (Math.random() - 0.5) * 10;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.08,
      color: new THREE.Color(themeColor),
      transparent: true,
      opacity: 0.35,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    const density = structure?.particle_density || 160;
    const twist = structure?.twist || 3.2;
    const primaryHex = structure?.color_a || themeColor;
    const secondaryHex = structure?.color_b || "#ffffff";

    const colorA = new THREE.Color(primaryHex);
    const colorB = new THREE.Color(secondaryHex);
    const linkColor = new THREE.Color(0xffffff);

    const sphereGeo = new THREE.SphereGeometry(0.13, 12, 12);
    const linkGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const matA = new THREE.MeshBasicMaterial({ color: colorA });
    const matB = new THREE.MeshBasicMaterial({ color: colorB });
    const matLink = new THREE.MeshBasicMaterial({ color: linkColor, transparent: true, opacity: 0.8 });

    const totalHeight = 13;
    const radius = 2.4;

    for (let i = 0; i < density; i++) {
      const t = i / density;
      const y = (t - 0.5) * totalHeight;
      const angle = t * Math.PI * 2 * twist;

      const meshA = new THREE.Mesh(sphereGeo, matA);
      meshA.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      dnaGroup.add(meshA);

      const meshB = new THREE.Mesh(sphereGeo, matB);
      meshB.position.set(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
      dnaGroup.add(meshB);

      if (i % 5 === 0) {
        const rungs = 7;
        for (let r = 1; r < rungs; r++) {
          const factor = r / rungs;
          const posA = meshA.position;
          const posB = meshB.position;
          const rx = posA.x * (1 - factor) + posB.x * factor;
          const rz = posA.z * (1 - factor) + posB.z * factor;
          const linkMesh = new THREE.Mesh(linkGeo, matLink);
          linkMesh.position.set(rx, y, rz);
          dnaGroup.add(linkMesh);
        }
      }
    }

    // Interaction variables (Mouse & Mobile Touch)
    let isDragging = false;
    let previousPosition = { x: 0, y: 0 };
    let initialPinchDistance = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isHovered = false;

    // Mouse Handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousPosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousPosition.x;
        const deltaY = e.clientY - previousPosition.y;
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
        previousPosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(8, Math.min(26, camera.position.z + e.deltaY * 0.02));
    };

    const onMouseEnter = () => {
      isHovered = true;
    };

    const onMouseLeave = () => {
      isHovered = false;
      isDragging = false;
    };

    // Mobile Touch Handlers
    const getTouchDistance = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDragging = false;
        initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        e.preventDefault(); // Prevent page scroll when interacting with 3D canvas
        const deltaX = e.touches[0].clientX - previousPosition.x;
        const deltaY = e.touches[0].clientY - previousPosition.y;
        targetRotationY += deltaX * 0.012;
        targetRotationX += deltaY * 0.012;
        previousPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && initialPinchDistance > 0) {
        e.preventDefault();
        const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
        const pinchDelta = initialPinchDistance - currentDist;
        camera.position.z = Math.max(8, Math.min(26, camera.position.z + pinchDelta * 0.05));
        initialPinchDistance = currentDist;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      initialPinchDistance = 0;
    };

    const domElement = renderer.domElement;
    domElement.style.cursor = "grab";
    domElement.style.touchAction = "none"; // Optimize touch gesture capture

    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("wheel", onWheel, { passive: false });
    domElement.addEventListener("mouseenter", onMouseEnter);
    domElement.addEventListener("mouseleave", onMouseLeave);

    // Touch listeners
    domElement.addEventListener("touchstart", onTouchStart, { passive: false });
    domElement.addEventListener("touchmove", onTouchMove, { passive: false });
    domElement.addEventListener("touchend", onTouchEnd);
    domElement.addEventListener("touchcancel", onTouchEnd);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        targetRotationY += 0.007;
      }

      dnaGroup.rotation.y += (targetRotationY - dnaGroup.rotation.y) * 0.1;
      dnaGroup.rotation.x += (targetRotationX - dnaGroup.rotation.x) * 0.1;

      // Subtle dust drift
      dustPoints.rotation.y += 0.001;

      const targetScale = isHovered ? 1.07 : 1.0;
      dnaGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("wheel", onWheel);
      domElement.removeEventListener("mouseenter", onMouseEnter);
      domElement.removeEventListener("mouseleave", onMouseLeave);

      domElement.removeEventListener("touchstart", onTouchStart);
      domElement.removeEventListener("touchmove", onTouchMove);
      domElement.removeEventListener("touchend", onTouchEnd);
      domElement.removeEventListener("touchcancel", onTouchEnd);

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [structure, themeColor]);

  return (
    <div className="bg-[#121216]/40 backdrop-blur-2xl border border-[var(--theme-border)] rounded-3xl p-4 sm:p-5 flex flex-col h-full shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <Dna size={16} className="text-[var(--theme-primary)] shrink-0" />
          <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-300 font-mono truncate">
            Genomic Visualization 3D
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono bg-zinc-900/90 border border-white/5 px-2 py-0.5 rounded shrink-0">
          <Hand size={10} className="text-[var(--theme-primary)]" />
          <span>Touch / Drag Rotate</span>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mb-3">
        Procedural codon matrix reconstructed from biological classification telemetry.
      </p>

      {/* 3D WebGL Viewport */}
      <div
        ref={mountRef}
        className="w-full h-[240px] sm:h-[280px] bg-[#070709] rounded-xl overflow-hidden border border-white/[0.06] relative shadow-inner"
      />

      {/* Genome parameters footer */}
      <div className="mt-4 space-y-2 text-xs divide-y divide-white/[0.05] font-mono">
        <div className="flex justify-between pt-2">
          <span className="text-zinc-500">Base Pairs</span>
          <span className="font-semibold text-zinc-200">{genomeData?.size || "~2.8 Gb"}</span>
        </div>
        <div className="flex justify-between pt-2">
          <span className="text-zinc-500">Annotated Genes</span>
          <span className="font-semibold text-zinc-200">{genomeData?.genes?.toLocaleString() || "24,800"}</span>
        </div>
        <div className="flex justify-between pt-2">
          <span className="text-zinc-500">Karyotype</span>
          <span className="font-semibold text-zinc-200">{genomeData?.chromosomes || "46 (2n)"}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="text-zinc-500">Twist & Chromatic Signature</span>
          <div className="flex items-center gap-2">
            <span className="text-[var(--theme-primary)] font-bold">{structure?.twist || 3.2}x</span>
            <div
              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: structure?.color_a || themeColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
