'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

// Animated floating particles
const FloatingParticle: React.FC<{ position: Vector3; color: string; size: number }> = ({ 
  position, 
  color, 
  size 
}) => {
  const meshRef = useRef<Mesh>(null);
  const initialY = position.y;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime + position.x) * 0.5;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
};

// Animated geometric shape
const AnimatedGeometry: React.FC<{ position: Vector3 }> = ({ position }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.8, 0]} />
      <meshBasicMaterial 
        color="#3b82f6" 
        transparent 
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
};

export const Scene: React.FC = () => {
  // Generate random particles
  const particles = useMemo(() => {
    const particleArray = [];
    for (let i = 0; i < 20; i++) {
      particleArray.push({
        position: new Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4
        ),
        color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6',
        size: Math.random() * 0.1 + 0.05
      });
    }
    return particleArray;
  }, []);

  // Generate geometric shapes
  const geometries = useMemo(() => {
    const geoArray = [];
    for (let i = 0; i < 5; i++) {
      geoArray.push({
        position: new Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3
        )
      });
    }
    return geoArray;
  }, []);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />

      {/* Floating particles */}
      {particles.map((particle, index) => (
        <FloatingParticle
          key={index}
          position={particle.position}
          color={particle.color}
          size={particle.size}
        />
      ))}

      {/* Animated geometric shapes */}
      {geometries.map((geo, index) => (
        <AnimatedGeometry
          key={index}
          position={geo.position}
        />
      ))}
    </>
  );
};
