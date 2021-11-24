<template>
  <div class="home">
    <div id="container"></div>
    <div class="plane">
      <button @click="changeEarthMode(0)">2d</button>
      <button @click="changeEarthMode(1)">3d</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TWEEN from "@tweenjs/tween.js";
import * as d3 from "d3";

let earth = null;
let line = null;
const geoLatLon = [
  [116.3672, 34.6289],
  [116.4551, 34.8926],
  [116.8066, 34.9365],
  [117.2461, 34.4531],
  [117.334, 34.585],
  [117.5977, 34.4531],
  [117.9492, 34.6729],
  [118.125, 34.6289],
  [118.2129, 34.4092],
  [118.3887, 34.4092],
  [118.4766, 34.6729],
  [118.7402, 34.7168],
  [118.916, 35.0244],
  [119.2676, 35.1123],
  [119.3555, 35.0244],
  [119.3555, 34.8486],
  [119.707, 34.585],
  [120.3223, 34.3652],
  [120.9375, 33.0469],
  [121.0254, 32.6514],
  [121.377, 32.4756],
  [121.4648, 32.168],
  [121.9043, 31.9922],
  [121.9922, 31.6846],
  [121.9922, 31.5967],
  [121.2012, 31.8604],
  [121.1133, 31.7285],
  [121.377, 31.5088],
  [121.2012, 31.4648],
  [120.9375, 31.0254],
  [120.498, 30.8057],
  [119.9707, 31.1572],
  [119.6191, 31.1133],
  [119.4434, 31.1572],
  [119.3555, 31.2891],
  [118.8281, 31.2451],
  [118.7402, 31.377],
  [118.916, 31.5527],
  [118.3887, 31.9482],
  [118.4766, 32.168],
  [118.6523, 32.2119],
  [118.5645, 32.5635],
  [119.1797, 32.4756],
  [119.1797, 32.8271],
  [118.916, 32.959],
  [118.7402, 32.7393],
  [118.3008, 32.7832],
  [118.2129, 33.2227],
  [118.0371, 33.1348],
  [117.9492, 33.2227],
  [118.125, 33.75],
  [117.7734, 33.7061],
  [117.5977, 34.0137],
  [117.1582, 34.0576],
  [116.8945, 34.4092],
  [116.3672, 34.6289],
];
let geo2dPoints = [];
let geo3dPoints = [];
let currentPoints = [];

const projection = d3
  .geoEquirectangular()
  .center([0, 0])
  .scale(2.5)
  .translate([0, 0]);

geoLatLon.forEach((i) => {
  geo2dPoints.push(latlonTo2d(i));
  geo3dPoints.push(latlonTo3d(i));
});

currentPoints = pointsClone(geo3dPoints);

onMounted(() => {
  let scene = initScreen();

  let camera = initCamera();
  camera.position.set(0, 0, 10);

  let renderer = initRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor("#404040", 1.0);
  document.getElementById("container").appendChild(renderer.domElement);

  let controls = initControls();
  controls.minDistance = 5;
  controls.maxDistance = 50;

  initAmbientLight("#FFF");
  initSkyBox();

  let earth2d = new THREE.PlaneBufferGeometry(
    Math.PI * 5,
    Math.PI * 2.5,
    36,
    18
  );
  earth2d.morphAttributes.position = [];

  let earth3dPoints = [];
  let uvs = earth2d.attributes.uv;
  let uv = new THREE.Vector2();
  let t = new THREE.Vector3();
  for (let i = 0; i < uvs.count; i++) {
    uv.fromBufferAttribute(uvs, i);
    t.setFromSphericalCoords(
      2.5,
      Math.PI * (1 - uv.y),
      Math.PI * (uv.x - 0.5) * 2
    );
    earth3dPoints.push(t.x, t.y, t.z);
  }
  earth2d.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
    earth3dPoints,
    3
  );

  let planeMat = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./texture/earth_daymap.jpg"),
    //color: 0x555555,
    morphTargets: true,
    side: THREE.DoubleSide,
  });
  earth = new THREE.Mesh(earth2d, planeMat);
  scene.add(earth);
  earth.morphTargetInfluences[0] = 1;

  const geometry = new THREE.BufferGeometry().setFromPoints(geo3dPoints);

  const material = new THREE.LineBasicMaterial({
    color: 0xff0000,
  });

  line = new THREE.Line(geometry, material);
  scene.add(line);

  renderer.setAnimationLoop(() => {
    TWEEN.update();
    renderer.render(scene, camera);
  });

  // 初始化场景
  function initScreen() {
    return new THREE.Scene();
  }

  // 初始化相机
  function initCamera() {
    return new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
  }

  // 初始化控制器
  function initControls() {
    return new OrbitControls(camera, renderer.domElement);
  }

  // 初始化渲染器
  function initRenderer() {
    return new THREE.WebGLRenderer({ antialias: true });
  }

  // 初始化环境光
  function initAmbientLight(color) {
    const light = new THREE.AmbientLight(color);
    scene.add(light);
  }

  // 初始化天空盒
  function initSkyBox() {
    const skyBoxGeometry = new THREE.SphereGeometry(1000, 64, 64);
    const skyBoxMaterial = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load("./texture/stars_milky_way.jpg"),
    });
    const skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    skyBox.receiveShadow = true;
    scene.add(skyBox);
  }
});

// eslint-disable-next-line no-unused-vars
function changeEarthMode(mode) {
  let coords = {
    time: earth.morphTargetInfluences[0],
    points: currentPoints,
  };
  switch (mode) {
    case 0:
      new TWEEN.Tween(coords)
        .to({ time: 0, points: geo2dPoints }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          earth.morphTargetInfluences[0] = coords.time;
          line.geometry = new THREE.BufferGeometry().setFromPoints(
            coords.points
          );
        })
        .start();
      break;
    case 1:
      new TWEEN.Tween(coords)
        .to({ time: 1, points: geo3dPoints }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          earth.morphTargetInfluences[0] = coords.time;
          line.geometry = new THREE.BufferGeometry().setFromPoints(
            coords.points
          );
        })
        .start();
      break;
  }
}

function latlonTo2d(latlon) {
  const position = projection(latlon);
  return new THREE.Vector3(position[0], -position[1], 0);
}

// eslint-disable-next-line no-unused-vars
function latlonTo3d(latlon) {
  const phi = (90 - latlon[1]) * (Math.PI / 180);
  const theta = (latlon[0] + 90) * (Math.PI / 180);
  const radius = 2.5;
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function pointsClone(points) {
  let clonePoints = [];
  points.forEach((i) => {
    clonePoints.push(new THREE.Vector3(i.x, i.y, i.z));
  });
  return clonePoints;
}
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
.plane {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
