<template>
  <div class="taiko">
    <div id="container"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, camera, controls, renderer;
let sun, mercury, venus, earth;
const Earth_Orbit_Radius = 469.589;

onMounted(() => {
  scene = initScreen();
  camera = initCamera();
  camera.position.y = 150;
  camera.position.z = 300;
  initStars();
  initSkyBox();
  initAmbientLight("#888");
  initDirectionalLight();
  /**
   * /名称/轨道半径/半径/自转/公转/
   * /太阳/0/109.13r
   * /水星/0.387/0.38r
   * /金星/0.723/0.95r
   * /地球/1=149587443.663km≈23479.429r等比缩小469.589r/1r=6371km
   * /月球/
   * /火星/1.524/0.53r
   * /木星/5.203/11.21r
   * /土星/9.555/9.45r
   * /天王星/19.22/4.01r
   * /海王星/30.11/3.88r
   */
  initSun();
  initMercury();
  initVenus();
  initEarth();
  renderer = initRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor("#404040", 1.0);
  document.getElementById("container").appendChild(renderer.domElement);
  controls = initControls();
  controls.minDistance = 10;
  controls.maxDistance = 5000;
  controls.maxPolarAngle = Math.PI / 2;
  animate();
});

function initScreen() {
  return new THREE.Scene();
}

function initCamera() {
  return new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
}

function initControls() {
  return new OrbitControls(camera, renderer.domElement);
}

function initRenderer() {
  return new THREE.WebGLRenderer({ antialias: true });
}

function initAmbientLight(color) {
  const light = new THREE.AmbientLight(color);
  scene.add(light);
}

function initDirectionalLight() {
  const directionalLight = new THREE.DirectionalLight(0xdddddd, 0.5);
  directionalLight.position.set(100, 100, 100);
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
  scene.add(dirLightHelper);
}

function initSkyBox() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("./texture/stars_milky_way.jpg", (texture) => {
    const skyBoxGeometry = new THREE.SphereGeometry(1000, 64, 64);
    const skyBoxMaterial = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      map: texture,
    });
    const skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    skyBox.receiveShadow = true;
    scene.add(skyBox);
  });
}

// eslint-disable-next-line no-unused-vars
function initStars() {
  let particles = 50000;
  let geometry = new THREE.BufferGeometry();
  let positions = [];
  let colors = [];
  let color = new THREE.Color();
  let n = 2000,
    n2 = n / 2;
  for (let i = 0; i < particles; i++) {
    // 点
    let x = Math.random() * n - n2;
    let y = Math.random() * n - n2;
    let z = Math.random() * n - n2;
    positions.push(x, y, z);
    // 颜色
    let vx = x / n + 0.5;
    let vy = y / n + 0.5;
    let vz = z / n + 0.5;
    color.setRGB(vx, vy, vz);
    colors.push(color.r, color.g, color.b);
  }
  // 添加点和颜色
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  let material = new THREE.PointsMaterial({
    size: 0.001,
    vertexColors: THREE.VertexColors,
  });
  /* 批量管理点 */
  let points = new THREE.Points(geometry, material);
  scene.add(points);
}

function initSun() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("./texture/sun.jpg", (texture) => {
    const sunGeometry = new THREE.SphereGeometry(109.13, 64, 64);
    const sunMaterial = new THREE.MeshStandardMaterial({
      map: texture,
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.castShadow = true;
    sun.receiveShadow = true;
    scene.add(sun);
  });
}

function initMercury() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("./texture/mercury.jpg", (texture) => {
    const mercuryGeometry = new THREE.SphereGeometry(0.38 * 10, 64, 64);
    const mercuryMaterial = new THREE.MeshStandardMaterial({
      map: texture,
    });
    mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.castShadow = true;
    mercury.receiveShadow = true;
    mercury.position.x = 0.387 * Earth_Orbit_Radius;
    scene.add(mercury);
  });
}

function initVenus() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("./texture/venus_surface.jpg", (texture) => {
    const venusGeometry = new THREE.SphereGeometry(0.95 * 10, 64, 64);
    const venusMaterial = new THREE.MeshStandardMaterial({
      map: texture,
    });
    venus = new THREE.Mesh(venusGeometry, venusMaterial);
    venus.castShadow = true;
    venus.receiveShadow = true;
    venus.position.x = 0.723 * Earth_Orbit_Radius;
    scene.add(venus);
  });
}

function initEarth() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("./texture/earth_daymap.jpg", (texture) => {
    const earthGeometry = new THREE.SphereGeometry(1 * 10, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: texture,
    });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.castShadow = true;
    earth.receiveShadow = true;
    earth.position.x = 1 * Earth_Orbit_Radius;
    scene.add(earth);
  });
}

function animate() {
  if (sun) {
    sun.rotation.y += 0.01;
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
</script>

<style></style>
