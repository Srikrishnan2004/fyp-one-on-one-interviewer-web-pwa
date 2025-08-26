import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { AudioPermissions } from "./components/AudioPermissions";

function App() {
  return (
    <AudioPermissions>
      <Loader />
      <Leva hidden />
      <PWAInstallPrompt />
      <UI />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience />
      </Canvas>
    </AudioPermissions>
  );
}

export default App;
