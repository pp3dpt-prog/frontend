import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

function Model({ url }) {
  const geom = useLoader(STLLoader, url);
  
  return (
    <mesh geometry={geom} castShadow receiveShadow>
      {/* Cor dourada mais clara para destacar no fundo preto */}
      <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

export default function Scene3D({ stlUrl }) {
  return (
    <div style={{ width: '100%', height: '400px', background: '#050505', borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 0, 50], fov: 45 }}>
        {/* ILUMINAÇÃO ESSENCIAL PARA NÃO FICAR PRETO */}
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} />

        <Suspense fallback={null}>
          {/* O Stage ajusta automaticamente a luz e a câmara ao tamanho do coração */}
          <Stage environment="city" intensity={0.5} contactShadow={true} shadowBias={-0.001}>
            <Center>
              {stlUrl && <Model url={stlUrl} />}
            </Center>
          </Stage>
        </Suspense>
        
        <OrbitControls makeDefault minDistance={20} maxDistance={150} />
      </Canvas>
    </div>
  );
}