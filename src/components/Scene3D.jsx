import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

function Model({ url }) {
  // Carrega o STL gerado pelo teu backend no Render
  const geom = useLoader(STLLoader, url);
  
  return (
    <mesh geometry={geom} castShadow receiveShadow>
      {/* Cor dourada viva para garantir visibilidade */}
      <meshStandardMaterial 
        color="#2759c5" 
        metalness={0.6} 
        roughness={0.3} 
      />
    </mesh>
  );
}

export default function Scene3D({ stlUrl }) {
  return (
    <div style={{ width: '100%', height: '400px', background: '#f1f5f9', borderRadius: '8px' }}>
      <Canvas shadows camera={{ position: [0, 0, 50], fov: 45 }}>
        {/* LUZES - Essencial para o objeto não ficar preto */}
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} />

        <Suspense fallback={null}>
          {/* O Stage resolve problemas de escala e iluminação ambiental automaticamente */}
          <Stage environment="city" intensity={0.5} contactShadow={true}>
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