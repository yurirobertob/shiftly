"use client";

import { useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * AuroraFlowBg — animated green aurora shader used behind the landing hero.
 *
 * Palette is locked to the current hero gradient colors:
 *   rgba(50, 172, 109, 1)  → medium green  (#32AC6D)
 *   rgba(209, 251, 155, 1) → light lime    (#D1FB9B)
 *
 * The shader paints a full-screen plane placed behind the camera's FOV and
 * animates flowing simplex-noise bands. Rendered as a `<Canvas>` absolutely
 * positioned to fill the hero section.
 */

const AuroraBackground = () => {
  const { scene } = useThree();

  useEffect(() => {
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        // ─── simplex noise ───
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv = vUv;

          // Flowing aurora patterns
          float flow1 = snoise(vec2(uv.x * 2.0 + time * 0.1,  uv.y * 0.5 + time * 0.05));
          float flow2 = snoise(vec2(uv.x * 1.5 + time * 0.08, uv.y * 0.8 + time * 0.03));
          float flow3 = snoise(vec2(uv.x * 3.0 + time * 0.12, uv.y * 0.3 + time * 0.07));

          // Streaky bands
          float streaks = sin((uv.x + flow1 * 0.3) * 8.0  + time * 0.2)  * 0.5 + 0.5;
          streaks      *= sin((uv.y + flow2 * 0.2) * 12.0 + time * 0.15) * 0.5 + 0.5;

          // Combine flows
          float aurora = (flow1 + flow2 + flow3) * 0.33 + 0.5;
          aurora = pow(aurora, 2.0);

          // ─── Green aurora palette (clamped to hero gradient range) ───
          // Floor is locked at rgba(50,172,109) so no patch goes darker
          // than the original gradient's darker end — text stays legible.
          vec3 floorGreen  = vec3(0.196, 0.675, 0.427); // rgba(50,172,109) — darkest allowed
          vec3 mediumGreen = vec3(0.35, 0.78, 0.50);    // slight step up
          vec3 brightGreen = vec3(0.55, 0.92, 0.62);    // vibrant mid-lime
          vec3 limeGreen   = vec3(0.82, 0.984, 0.608);  // rgba(209,251,155) — lightest
          vec3 greenAccent = vec3(0.45, 0.88, 0.58);    // saturated green accent

          vec3 color = floorGreen;

          // Medium green flows
          float mediumFlow = smoothstep(0.3, 0.7, aurora + streaks * 0.3);
          color = mix(color, mediumGreen, mediumFlow);

          // Brighter green highlights
          float brightFlow = smoothstep(0.6, 0.9, aurora + flow1 * 0.4);
          color = mix(color, brightGreen, brightFlow);

          // Lime streaks (the lightest pops)
          float limeFlow = smoothstep(0.8, 1.0, streaks + aurora * 0.5);
          color = mix(color, limeGreen, limeFlow * 0.85);

          // Green accent hints
          float accentFlow = smoothstep(0.7, 0.95, flow3 + streaks * 0.2);
          color = mix(color, greenAccent, accentFlow * 0.5);

          // Final safety clamp: never go darker than floorGreen
          color = max(color, floorGreen);

          // Subtle grain
          float noise = snoise(uv * 100.0) * 0.015;
          color += noise;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -50;
    scene.add(mesh);

    let raf = 0;
    const animate = () => {
      material.uniforms.time.value += 0.01;
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    };
  }, [scene]);

  return null;
};

const CameraController = () => {
  const { camera } = useThree();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    camera.position.x = Math.sin(time * 0.05) * 3;
    camera.position.y = Math.cos(time * 0.07) * 2;
    camera.position.z = 30;
    camera.lookAt(0, 0, -30);
  });

  return null;
};

export function AuroraFlowBg() {
  return (
    <Canvas
      className="!absolute inset-0 h-full w-full"
      camera={{ position: [0, 0, 30], fov: 75 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
    >
      <AuroraBackground />
      <CameraController />
      <ambientLight intensity={0.9} />
      <pointLight
        position={[20, 20, 10]}
        intensity={0.8}
        color="#7FD99B"
        distance={100}
        decay={2}
      />
      <pointLight
        position={[-20, -10, 5]}
        intensity={0.6}
        color="#D1FB9B"
        distance={80}
        decay={2}
      />
    </Canvas>
  );
}
