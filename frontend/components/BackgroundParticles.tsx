"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const BioShape1 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m8 17 4 4 4-4" />
  </svg>
);

const BioShape2 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M3 12h5" />
    <path d="M16 12h5" />
    <path d="M12 3v5" />
    <path d="M12 16v5" />
    <path d="m5 5 3.5 3.5" />
    <path d="m15.5 15.5 3.5 3.5" />
    <path d="m5 19 3.5-3.5" />
    <path d="m15.5 8.5 3.5-3.5" />
  </svg>
);

const Hexagon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
  </svg>
);

const Microbe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
)

interface ParticleElem {
  id: number;
  shapeIdx: number;
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  scale: number;
  duration: number;
  opacity: number;
  delay: number;
  rotationInfo: number;
}

export default function BackgroundParticles() {
  const [elements, setElements] = useState<ParticleElem[]>([]);

  useEffect(() => {
    let active = true;
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 15 : 35;

    const generateParticle = (i: number): ParticleElem => {
      return {
        id: i,
        shapeIdx: Math.floor(Math.random() * 7),
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        targetX: Math.random() * 40 - 20,
        targetY: Math.random() * 40 - 20,
        scale: 1.5 + Math.random() * 3.5,
        duration: 15 + Math.random() * 25,
        opacity: 0.2 + Math.random() * 0.3,
        delay: Math.random() * 10,
        rotationInfo: Math.random() * 360,
      };
    };

    const newElems = Array.from({ length: count }).map((_, i) => generateParticle(i));
    if (active) setElements(newElems);
    
    return () => { active = false; };
  }, []);

  const shapes = [BioShape1, BioShape2, Hexagon, Microbe, () => <div className="w-2 h-2 rounded-full bg-current" />, () => <div className="w-1.5 h-1.5 rounded-full bg-current" />, () => <div className="w-1 h-1 rounded-full bg-current" />];

  if (elements.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el) => {
        const Shape = shapes[el.shapeIdx];
        return (
          <motion.div
            key={el.id}
            className="absolute text-[var(--theme-primary)] drop-shadow-[0_0_12px_var(--theme-primary-glow)]"
            initial={{
              x: `${el.initialX}vw`,
              y: `${el.initialY}vh`,
              opacity: 0,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              x: [`${el.initialX}vw`, `${el.initialX + el.targetX}vw`, `${el.initialX}vw`],
              y: [`${el.initialY}vh`, `${el.initialY + el.targetY}vh`, `${el.initialY}vh`],
              opacity: [el.opacity * 0.5, el.opacity, el.opacity * 0.5],
              scale: [el.scale, el.scale * 1.2, el.scale],
              rotate: [el.rotationInfo, el.rotationInfo + 180, el.rotationInfo + 360],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              ease: "linear",
              delay: el.delay,
            }}
          >
            <Shape />
          </motion.div>
        );
      })}
    </div>
  );
}

