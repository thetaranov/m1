
import React, { Component, Suspense, ReactNode, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Environment, Html, useGLTF, Center } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

// Augment JSX namespace to include React Three Fiber elements.
// We declare both global and module-scoped JSX to ensure Typescript picks it up correctly
// regardless of configuration (e.g. "jsx": "react-jsx").
declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: any;
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      primitive: any;
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
    }
  }
}

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Model Loading Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface Grill3DProps {
  url?: string | null;
  enableControls?: boolean;
  isVisible?: boolean;
}

const GrillModel: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);

  useLayoutEffect(() => {
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
           obj.material.roughness = 0.2; 
           obj.material.metalness = 0.7;
           obj.material.envMapIntensity = 1.5;
           obj.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return (
    <Center>
      <primitive object={scene} scale={0.45} />
    </Center>
  );
};

const LoadingPlaceholder = () => {
  return (
    <group>
      <mesh>
        <boxGeometry args={[5, 7, 3]} />
        <meshStandardMaterial 
            color="#333" 
            wireframe={true}
            transparent
            opacity={0.2}
        />
      </mesh>
      <Html center>
        <div className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/10">
           <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-2" />
           <span className="text-xs font-bold text-gray-200 whitespace-nowrap">Загрузка модели...</span>
        </div>
      </Html>
    </group>
  );
};

const ErrorPlaceholder = () => {
  return (
    <group>
      <mesh>
        <boxGeometry args={[5, 7, 3]} />
        <meshStandardMaterial color="#7f1d1d" wireframe={true} />
      </mesh>
      <Html center>
        <div className="bg-red-900/40 backdrop-blur-md p-3 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold whitespace-nowrap">
          Ошибка загрузки модели
        </div>
      </Html>
    </group>
  );
};

const Grill3D: React.FC<Grill3DProps> = ({ url = null, enableControls = true, isVisible = true }) => {
  // If not visible, we don't render the canvas at all to save WebGL context resources
  if (!url || !isVisible) return null;

  return (
    <div className="w-full h-full bg-transparent relative touch-none">
      <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 50, position: [10, 10, 10] }}>
        <Suspense fallback={<LoadingPlaceholder />}>
          <ErrorBoundary fallback={<ErrorPlaceholder />}>
            <Stage environment="city" intensity={0.5} adjustCamera={false}>
              <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                  <GrillModel url={url} />
              </Float>
            </Stage>
          </ErrorBoundary>
          <Environment preset="studio" />
        </Suspense>
        
        <OrbitControls 
          makeDefault
          autoRotate 
          autoRotateSpeed={2} 
          enableZoom={enableControls} 
          enableRotate={enableControls}
          enablePan={enableControls}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      
      {enableControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-xs font-semibold text-gray-400 pointer-events-none select-none shadow-lg">
          Вращайте • Приближайте
        </div>
      )}
    </div>
  );
};

export default Grill3D;
