'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';

interface GenerativeArtCanvasProps {
  className?: string;
}

export const GenerativeArtCanvas: React.FC<GenerativeArtCanvasProps> = ({ className }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};
