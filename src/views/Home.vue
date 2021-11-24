<template>
  <div class="home">
    <div id="container"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

onMounted(() => {
  const scene = initScreen();
  const camera = initCamera();

  // let particles = 100000;
  // let geometry = new THREE.BufferGeometry();
  // let positions = [];
  // let colors = [];
  // let color = new THREE.Color();
  // let n = 500,
  //   n2 = n / 2;
  // for (let i = 0; i < particles; i++) {
  //   // 点
  //   let x = Math.random() * n - n2;
  //   let y = Math.random() * n - n2;
  //   let z = Math.random() * n - n2;
  //   positions.push(x, y, z);
  //   // 颜色
  //   let vx = x / n + 0.5;
  //   let vy = y / n + 0.5;
  //   let vz = z / n + 0.5;
  //   color.setRGB(vx, vy, vz);
  //   colors.push(color.r, color.g, color.b);
  // }
  // // 添加点和颜色
  // geometry.setAttribute(
  //   "position",
  //   new THREE.Float32BufferAttribute(positions, 3)
  // );
  // geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  // let material = new THREE.PointsMaterial({
  //   size: 0.001,
  //   vertexColors: THREE.VertexColors,
  // });
  // /* 批量管理点 */
  // let points = new THREE.Points(geometry, material);
  // scene.add(points);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("./texture/jingshu.jpg", (texture) => {
    const planegeometry = new THREE.CircleGeometry(150, 64);
    const planematerial = new THREE.MeshStandardMaterial({
      map: texture,
    });
    const plane = new THREE.Mesh(planegeometry, planematerial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.receiveShadow = true;
    scene.add(plane);

    const loader = new GLTFLoader();
    loader.load("./models/scene.gltf", (gltf) => {
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      scene.add(gltf.scene);
    });
  });

  const lathegeometry = new THREE.LatheGeometry(
    [new THREE.Vector2(150, 0), new THREE.Vector2(150, 100)],
    64
  );
  const lathematerial = new THREE.MeshStandardMaterial({
    color: "rgb(50,50,50)",
    side: THREE.DoubleSide,
  });
  const lathe = new THREE.Mesh(lathegeometry, lathematerial);
  lathe.receiveShadow = true;
  scene.add(lathe);

  initAmbientLight("#888");

  const spotLight = new THREE.SpotLight(0xdddddd, 0.5);
  spotLight.position.set(0, 100, 100);
  spotLight.angle = Math.PI / 6;
  spotLight.decay = 2;
  spotLight.castShadow = true;
  scene.add(spotLight);

  const spotLightHelper = new THREE.SpotLightHelper(spotLight, 5);
  scene.add(spotLightHelper);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.getElementById("container").appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 10;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  function initScreen() {
    return new THREE.Scene();
  }

  function initCamera() {
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.y = 15;
    camera.position.z = 50;
    return camera;
  }

  function initAmbientLight(color) {
    const light = new THREE.AmbientLight(color);
    scene.add(light);
  }
});
</script>

<style lang="scss" scoped>
.home {
  height: 100%;
  width: 100%;
}
#container {
  height: 100%;
  width: 100%;
}
</style>
