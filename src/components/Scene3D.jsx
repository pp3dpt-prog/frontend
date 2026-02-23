import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

function Model({ url }) {
  // Usamos o useLoader padrão do Fiber com o STLLoader do Three.js
  const geom = useLoader(STLLoader, url);
  
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.2} />
    </mesh>
  );
}

export default function Scene3D({ stlUrl }) {
  return (
    <div style={{ width: '100%', height: '400px', background: '#f0f0f0', borderRadius: '8px' }}>
      <Canvas shadows camera={{ position: [0, 0, 100], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Center>
              {stlUrl && <Model url={stlUrl} />}
            </Center>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}