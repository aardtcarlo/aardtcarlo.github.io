// Globe background script
const container = document.getElementById('globe-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xf4f4f4);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Resize handler
function resizeRenderer() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resizeRenderer);
resizeRenderer();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.zoomSpeed = 0.8;
controls.enablePan = false;
controls.rotateSpeed = 0.5;

let isUserInteracting = false;
controls.addEventListener('start', () => (isUserInteracting = true));
controls.addEventListener('end', () => (isUserInteracting = false));

// Load bump texture and create globe
const textureLoader = new THREE.TextureLoader();
textureLoader.load('textures/earth_texture4.jpg', (bumpTexture) => {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    bumpMap: bumpTexture,
    bumpScale: 0.08,
    roughness: 0.7,
    metalness: 0.1
  });

  const geometry = new THREE.SphereGeometry(5, 50, 50);
  const globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    if (!isUserInteracting) {
      globe.rotation.y += 0.0015;
    }
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
});
