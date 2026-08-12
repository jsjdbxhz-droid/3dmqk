import { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { Loader2, Maximize2 } from 'lucide-react';

interface Model3DViewerProps {
  modelUrl?: string | null;
  bgColor: string;
  autoRotate?: boolean;
  wireframe?: boolean;
  className?: string;
}

function GLTFModel({ url, wireframe }: { url: string; wireframe?: boolean }) {
  const { scene } = useGLTF(url);
  const cloned = useRef(scene.clone());

  if (wireframe) {
    cloned.current.traverse((child) => {
      if ((child as any).isMesh) {
        (child as any).material.wireframe = true;
      }
    });
  }

  return <primitive object={cloned.current} scale={1} />;
}

function PlaceholderModel({ wireframe }: { wireframe?: boolean }) {
  return (
    <mesh castShadow receiveShadow>
      <torusKnotGeometry args={[0.8, 0.3, 128, 32]} />
      <meshStandardMaterial
        color="#06b6d4"
        metalness={0.4}
        roughness={0.3}
        wireframe={wireframe}
      />
    </mesh>
  );
}

export default function Model3DViewer({
  modelUrl,
  bgColor,
  autoRotate = true,
  wireframe = false,
  className = '',
}: Model3DViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Canvas
        shadows
        camera={{ position: [3, 2, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: bgColor }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <Suspense fallback={null}>
          {modelUrl && !error ? (
            <GLTFModel url={modelUrl} wireframe={wireframe} />
          ) : (
            <PlaceholderModel wireframe={wireframe} />
          )}
          <Environment preset="city" />
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />
          <Grid
            position={[0, -1.5, 0]}
            args={[20, 20]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#334155"
            sectionSize={2.5}
            sectionThickness={1}
            sectionColor="#06b6d4"
            fadeDistance={15}
            fadeStrength={1}
            infiniteGrid
          />
        </Suspense>
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={handleFullscreen}
          className="p-2 rounded-lg bg-slate-900/80 backdrop-blur text-white hover:bg-slate-800 transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
