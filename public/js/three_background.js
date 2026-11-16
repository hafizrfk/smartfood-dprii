// Interactive 3D Ambient Background using Three.js for SmartFood ERP (Dark Mode)

(function init3DBackground() {
  const canvas = document.getElementById('three-bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070b14, 0.0018);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 45;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Ambient & Directional Lights
  const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xf59e0b, 1.8, 80);
  pointLight1.position.set(25, 20, 20);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x10b981, 1.5, 80);
  pointLight2.position.set(-25, -20, 15);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0x6366f1, 1.2, 90);
  pointLight3.position.set(0, 30, -10);
  scene.add(pointLight3);

  // Group for rotating elements
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // 1. Floating 3D Geometric Objects (Representing Snacks / Cookies / Floating Geometry in Zero-Gravity)
  const geometries = [
    new THREE.TorusGeometry(2.5, 0.8, 16, 32),       // Donut / Cookie shape
    new THREE.IcosahedronGeometry(2, 0),             // Gem / Snack shape
    new THREE.TorusKnotGeometry(1.8, 0.5, 64, 8),    // Makaroni / Pretzel spiral
    new THREE.DodecahedronGeometry(2.2, 0),          // Snack polyhedron
    new THREE.CylinderGeometry(1.2, 1.2, 3, 16)      // Momogi cylinder stick
  ];

  const materials = [
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.65
    }),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.7,
      wireframe: false,
      transparent: true,
      opacity: 0.6
    }),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.55
    }),
    new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.55
    }),
    new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.5
    })
  ];

  const floatingMeshes = [];
  const meshCount = 18;

  for (let i = 0; i < meshCount; i++) {
    const geo = geometries[i % geometries.length];
    const mat = materials[i % materials.length].clone();
    // Some wireframe for futuristic tech vibe
    if (i % 3 === 0) {
      mat.wireframe = true;
      mat.opacity = 0.4;
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 40 - 10
    );

    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    const scale = 0.4 + Math.random() * 0.6;
    mesh.scale.set(scale, scale, scale);

    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.008,
      rotSpeedY: (Math.random() - 0.5) * 0.012,
      rotSpeedZ: (Math.random() - 0.5) * 0.006,
      floatSpeed: 0.0008 + Math.random() * 0.0015,
      floatOffset: Math.random() * Math.PI * 2,
      initialY: mesh.position.y
    };

    mainGroup.add(mesh);
    floatingMeshes.push(mesh);
  }

  // 2. Starfield & Ambient Micro-Particle Swarm
  const particleCount = 600;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color(0xf59e0b), // Amber gold
    new THREE.Color(0x10b981), // Emerald green
    new THREE.Color(0x38bdf8), // Sky blue
    new THREE.Color(0xa855f7)  // Purple
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 70 - 15;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = chosenColor.r;
    colors[i * 3 + 1] = chosenColor.g;
    colors[i * 3 + 2] = chosenColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 1.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // 3. Mouse Parallax Interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    // Subtle camera drift based on mouse
    camera.position.x = mouseX * 4;
    camera.position.y = -mouseY * 3;
    camera.lookAt(0, 0, -10);

    // Gently rotate main group
    mainGroup.rotation.y = elapsedTime * 0.02 + mouseX * 0.1;
    mainGroup.rotation.x = mouseY * 0.08;

    // Animate individual floating meshes
    for (let i = 0; i < floatingMeshes.length; i++) {
      const mesh = floatingMeshes[i];
      mesh.rotation.x += mesh.userData.rotSpeedX;
      mesh.rotation.y += mesh.userData.rotSpeedY;
      mesh.rotation.z += mesh.userData.rotSpeedZ;

      // Floating sine wave
      mesh.position.y = mesh.userData.initialY + Math.sin(elapsedTime * 0.8 + mesh.userData.floatOffset) * 2.5;
    }

    // Slowly drift particles
    particles.rotation.y = elapsedTime * 0.015;
    particles.rotation.x = -elapsedTime * 0.008;

    renderer.render(scene, camera);
  }

  animate();
})();
