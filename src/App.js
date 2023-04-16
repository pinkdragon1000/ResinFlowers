import { useLayoutEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMask, useGLTF, Instances, CameraControls } from "@react-three/drei";
import {
  Lightformer,
  Environment,
  MeshTransmissionMaterial,
} from "@react-three/drei";

export default function App() {
  return (
    <Canvas
      shadows
      camera={{ position: [30, 0, -3], fov: 35, near: 1, far: 50 }}
    >
      <color attach="background" args={["#999"]} />
      {/** Glass aquarium */}
      <Aquarium position={[0, 0.25, 0]}>
        <Flowers position={[0, -2, -0.5]} scale={4} />
      </Aquarium>
      {/** Custom environment map */}
      <Environment resolution={1024}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer
            intensity={4}
            rotation-x={Math.PI / 2}
            position={[0, 5, -9]}
            scale={[10, 10, 1]}
          />
          {[2, 0, 2, 0, 2, 0, 2, 0].map((x, i) => (
            <Lightformer
              key={i}
              form="circle"
              intensity={4}
              rotation={[Math.PI / 2, 0, 0]}
              position={[x, 4, i * 4]}
              scale={[4, 1, 1]}
            />
          ))}
          <Lightformer
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={[50, 2, 1]}
          />
          <Lightformer
            intensity={2}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={[50, 2, 1]}
          />
        </group>
      </Environment>
      <CameraControls
        truckSpeed={0}
        dollySpeed={0}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}

function Aquarium({ children, ...props }) {
  const ref = useRef();
  const { nodes } = useGLTF("/shapes-transformed.glb");
  const stencil = useMask(1, false);
  useLayoutEffect(() => {
    // Apply stencil to all contents
    ref.current.traverse(
      (child) => child.material && Object.assign(child.material, { ...stencil })
    );
  }, []);
  return (
    <group {...props} dispose={null}>
      <mesh castShadow scale={[0.2, 5, 5]} geometry={nodes.Cube.geometry}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={3}
          chromaticAberration={0.025}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
        />
      </mesh>
      <group ref={ref}>{children}</group>
    </group>
  );
}

//Source: https://sketchfab.com/3d-models/flowers-b56e199f962f49b29686c1a891fe47bd

function Flowers(props) {
  const { scene } = useGLTF("/flowers.glb");
  useFrame(
    (state) => (scene.rotation.z = Math.sin(state.clock.elapsedTime / 4) / 2)
  );
  return <primitive object={scene} {...props} />;
}
