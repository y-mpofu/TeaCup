// Frontend/src/components/TeapotLoading3D.tsx
// Simple steaming teapot 3D animation using Three.js

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Define props interface
interface TeapotLoading3DProps {
  message?: string;
  subtitle?: string;
}

// Steaming Teapot 3D Model Component
function SteamingTeapotModel() {
  const teapotGroupRef = useRef<THREE.Group>(null);
  const steamParticlesRef = useRef<THREE.Points>(null);

  // Create vigorous steam particles geometry
  const steamGeometry = useMemo(() => {
    const particleCount = 150; // Much more particles for vigorous steam
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.2; // X - wider spread
      positions[i * 3 + 1] = Math.random() * 4; // Y - much taller steam
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2; // Z - wider spread
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  // Animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Gentle teapot floating/bobbing animation
    if (teapotGroupRef.current) {
      teapotGroupRef.current.position.y = Math.sin(time * 0.8) * 0.05; // Gentle bobbing
      teapotGroupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1; // Slight rotation
    }

    // Animate vigorous steam particles
    if (steamParticlesRef.current && steamParticlesRef.current.geometry.attributes.position) {
      const positionAttribute = steamParticlesRef.current.geometry.attributes.position;
      const positions = positionAttribute.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Move particles up with much faster, more vigorous speeds
        const particleIndex = i / 3;
        const baseSpeed = 0.03; // Much faster base speed
        const variableSpeed = Math.sin(time * 3 + particleIndex) * 0.02; // More variable speed
        const vigorousSpeed = baseSpeed + variableSpeed + Math.random() * 0.01;
        positions[i + 1] += vigorousSpeed; // Y position (rising vigorously)
        
        // Add more dramatic swirl and turbulence
        const strongSwirl = Math.sin(time * 4 + particleIndex) * 0.008; // Stronger swirl
        const turbulence = Math.cos(time * 6 + particleIndex * 2) * 0.006; // Turbulence
        const randomDrift = (Math.random() - 0.5) * 0.002; // Random movement
        
        positions[i] += strongSwirl + randomDrift; // X sway (vigorous swirl)
        positions[i + 2] += turbulence + randomDrift; // Z drift (turbulent)
        
        // Reset particles when they get too high, with more staggered timing
        if (positions[i + 1] > 4.5 + Math.sin(particleIndex) * 1) {
          positions[i] = (Math.random() - 0.5) * 0.15; // X (start from spout area)
          positions[i + 1] = 0.3 + Math.random() * 0.3; // Y (start from spout)
          positions[i + 2] = (Math.random() - 0.5) * 0.15; // Z
        }
      }
      
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Teapot Group - Centered and prominent */}
      <group ref={teapotGroupRef} position={[0, 0, 0]}>
        {/* Teapot Body - Main sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial 
            color="#8B4513" 
            metalness={0.4} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Teapot Lid */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.25, 32]} />
          <meshStandardMaterial 
            color="#A0522D" 
            metalness={0.5} 
            roughness={0.2}
          />
        </mesh>
        
        {/* Lid Knob */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color="#654321" 
            metalness={0.3} 
            roughness={0.5}
          />
        </mesh>
        
        {/* Teapot Spout */}
        <mesh position={[0.9, 0.1, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.08, 0.12, 1, 12]} />
          <meshStandardMaterial 
            color="#8B4513" 
            metalness={0.4} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Teapot Handle */}
        <mesh position={[-0.9, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.05, 8, 16]} />
          <meshStandardMaterial 
            color="#654321" 
            metalness={0.3} 
            roughness={0.5}
          />
        </mesh>

        {/* Base/Bottom Ring */}
        <mesh position={[0, -0.75, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
          <meshStandardMaterial 
            color="#654321" 
            metalness={0.2} 
            roughness={0.6}
          />
        </mesh>

        {/* Decorative Band around middle */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.08, 32]} />
          <meshStandardMaterial 
            color="#D2691E" 
            metalness={0.6} 
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Vigorous Steam Particles - Rising from spout */}
      <points ref={steamParticlesRef} position={[1.2, 0.4, 0]}>
        <primitive object={steamGeometry} />
        <pointsMaterial 
          color="white" 
          size={0.06} 
          transparent 
          opacity={0.8}
          sizeAttenuation={true}
        />
      </points>

      {/* Additional vigorous steam from lid */}
      <points position={[0, 0.9, 0]}>
        <primitive object={steamGeometry} />
        <pointsMaterial 
          color="white" 
          size={0.04} 
          transparent 
          opacity={0.6}
          sizeAttenuation={true}
        />
      </points>

      {/* Extra steam burst from spout tip for maximum effect */}
      <points position={[1.4, 0.5, 0]}>
        <primitive object={steamGeometry} />
        <pointsMaterial 
          color="white" 
          size={0.05} 
          transparent 
          opacity={0.7}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
}

// Lighting Setup Component
function SceneLighting() {
  return (
    <>
      {/* Soft ambient light for overall illumination */}
      <ambientLight intensity={0.5} />
      
      {/* Main directional light from top-right */}
      <directionalLight 
        position={[4, 6, 4]} 
        intensity={1} 
        castShadow
        color="#FFFAF0" // Warm white
      />
      
      {/* Fill light from the left */}
      <directionalLight 
        position={[-3, 4, 2]} 
        intensity={0.4} 
        color="#FFF8DC" // Cornsilk
      />
      
      {/* Rim light from behind for edge lighting */}
      <directionalLight 
        position={[0, 3, -4]} 
        intensity={0.3}
        color="#F5DEB3" // Wheat
      />
      
      {/* Subtle spot light for steam illumination */}
      <spotLight 
        position={[2, 4, 2]} 
        intensity={0.4}
        angle={0.4}
        penumbra={0.6}
        color="#FFFFFF"
      />
    </>
  );
}

// Main 3D Loading Component
export default function TeapotLoading3D({ 
  message = "Brewing Your Perfect Cup...", 
  subtitle = "Steeping the finest stories for you" 
}: TeapotLoading3DProps) {
  return (
    <div style={{ 
      width: '100%', 
      height: '500px', 
      background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(160, 82, 45, 0.05) 100%)',
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* 3D Canvas */}
      <div style={{ width: '100%', height: '350px' }}>
        <Canvas 
          camera={{ position: [0, 1, 5], fov: 60 }}
          shadows
          gl={{ antialias: true }}
        >
          <SceneLighting />
          <SteamingTeapotModel />
          
          {/* Allow user to orbit around the teapot */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate 
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>
      </div>
      
      {/* Loading Text */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px',
        color: '#8B4513'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          marginBottom: '8px',
          fontWeight: 'bold'
        }}>
          {message}
        </h2>
        <p style={{ 
          fontSize: '16px', 
          opacity: 0.8,
          marginBottom: '15px'
        }}>
          {subtitle}
        </p>
        
        {/* Animated loading dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#8B4513',
                borderRadius: '50%',
                animation: `dot-bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* CSS for dot animation */}
      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}