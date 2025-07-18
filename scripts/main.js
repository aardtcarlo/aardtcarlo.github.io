const container = document.getElementById('globe-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xf4f4f4);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Handle window resizing
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.zoomSpeed = 0.8;
controls.enablePan = false;
controls.rotateSpeed = 0.5;

let isUserInteracting = false;
controls.addEventListener('start', () => isUserInteracting = true);
controls.addEventListener('end', () => isUserInteracting = false);

const textureLoader = new THREE.TextureLoader();
let globe; // will hold the globe for later rotation

textureLoader.load('textures/earth_texture4.jpg', (bumpTexture) => {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    bumpMap: bumpTexture,
    bumpScale: 0.08,
    roughness: 0.7,
    metalness: 0.1
  });

  const geometry = new THREE.SphereGeometry(5, 50, 50);
  globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // Load and plot city lines
  fetch('data/cities_relevant.json')
    .then(res => res.json())
    .then(cities => {
      const maxPop = Math.max(...cities.map(city => city.population));

      cities.forEach(city => {
        const radius = 5;
        const spikeLength = Math.sqrt(city.population) / 2000;

        const base = latLonToVector3(city.lat, city.lon, radius);
        const tip = latLonToVector3(city.lat, city.lon, radius + spikeLength);

        const geometry = new THREE.BufferGeometry().setFromPoints([base, tip]);
        const material = new THREE.LineBasicMaterial({
                        color: 0x444444,
                        transparent: true,
                        opacity: 0.4 
                        });

        const line = new THREE.Line(geometry, material);

        // Attach to globe so it rotates in sync
        globe.add(line);
      });
    });

  animate();
});

// Convert lat/lon to 3D vector
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (!isUserInteracting && globe) {
    globe.rotation.y += 0.0015;
  }

  controls.update();
  renderer.render(scene, camera);
}
