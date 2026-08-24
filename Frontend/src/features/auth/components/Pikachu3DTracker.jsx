import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export default function Pikachu3DTracker({ className = '' }) {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId;
    let mixer = null;
    let headBone = null;
    let neckBone = null;
    let modelRoot = null;

    // Target rotations for smooth lerping
    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 580;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 3.2);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
    sunLight.position.set(3, 5, 4);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x70d6ff, 1.4);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd166, 1.8);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // 5. Load Pikachu 3D Model with DRACOLoader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dracoLoader.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/pikachu.glb',
      (gltf) => {
        modelRoot = gltf.scene;

        // Traverse model to optimize materials and find head bone
        modelRoot.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.material) {
              node.material.roughness = 0.55;
              node.material.metalness = 0.05;
              node.material.needsUpdate = true;
            }
          }

          const name = (node.name || '').toLowerCase();
          if (!headBone && (name.includes('head') || name.includes('face') || name.includes('bip01_head'))) {
            headBone = node;
          }
          if (!neckBone && (name.includes('neck') || name.includes('spine2') || name.includes('bip01_neck'))) {
            neckBone = node;
          }
        });

        // Compute Bounding Box & Scale
        const box = new THREE.Box3().setFromObject(modelRoot);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.4 / (maxDim || 1);
        modelRoot.scale.set(scale, scale, scale);

        // Center on X and Z, set base on Y
        modelRoot.position.x = -center.x * scale;
        modelRoot.position.y = -box.min.y * scale - 0.45;
        modelRoot.position.z = -center.z * scale;

        // Initial orientation facing slightly towards center
        modelRoot.rotation.y = 0.2;

        // Play idle animation if present
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(modelRoot);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        scene.add(modelRoot);
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error loading 3D Pikachu:', err);
        setLoadError(true);
        setIsLoading(false);
      }
    );

    // 6. Gaze & Cursor Tracking (face_looker logic)
    const handleMouseMove = (e) => {
      const windowWidth = window.innerWidth || 1000;
      const windowHeight = window.innerHeight || 800;

      // Normalized coordinates from -1 to 1 across the screen
      const nx = (e.clientX / windowWidth) * 2 - 1;
      const ny = -(e.clientY / windowHeight) * 2 + 1;

      // Maximum look angles: Yaw +- 38 deg, Pitch +- 22 deg
      targetRotation.y = nx * 0.7;
      targetRotation.x = -ny * 0.38;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 7. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (mixer) {
        mixer.update(delta);
      }

      // Smooth Lerp interpolation for natural, fluid gazing
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

      if (modelRoot) {
        // Natural idle breathing float
        const idleFloat = Math.sin(elapsed * 2.2) * 0.035;

        // Apply rotation to head/neck if bone exists, or rotate root model smoothly
        if (headBone) {
          headBone.rotation.y = currentRotation.y * 0.85;
          headBone.rotation.x = currentRotation.x * 0.75;
          if (neckBone) {
            neckBone.rotation.y = currentRotation.y * 0.35;
          }
          // Body follows softly
          modelRoot.rotation.y = 0.2 + currentRotation.y * 0.4;
          modelRoot.rotation.x = currentRotation.x * 0.15;
        } else {
          // Whole body turns to follow the user cursor
          modelRoot.rotation.y = 0.2 + currentRotation.y * 0.85;
          modelRoot.rotation.x = currentRotation.x * 0.45;
        }

        // Apply idle motion without overwriting base Y
        modelRoot.position.y += Math.sin(elapsed * 2.5) * 0.0005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth && newHeight) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      dracoLoader.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] md:min-h-[580px] flex items-center justify-center ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Skeleton Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-sky-200/40 backdrop-blur-sm z-20 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mb-3"></div>
          <span className="text-xs font-bold text-sky-900 tracking-wider uppercase">
            Loading 3D Pikachu...
          </span>
        </div>
      )}

      {/* Error Fallback if WebGL isn't supported */}
      {loadError && (
        <img
          src="/assets/pikachu.jpg"
          alt="3D Pikachu Character"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
    </div>
  );
}
