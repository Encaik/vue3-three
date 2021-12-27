<template>
  <div id="container"></div>
</template>

<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

onMounted(() => {
  let scene = initScreen();

  let camera = initCamera();
  camera.rotation.set(-0.25 * Math.PI, 0, 0);

  let renderer = initRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor("#404040", 1.0);
  document.getElementById("container").appendChild(renderer.domElement);

  let controls = initControls();
  controls.minDistance = 0.1;
  controls.maxDistance = 5000;

  initAmbientLight("#FFF");

  const light = new THREE.DirectionalLight(0xe65ed, 1);
  scene.add(light);
  light.castShadow = true;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 100;
  light.shadow.camera.left = -35;
  light.shadow.camera.right = 35;
  light.shadow.camera.top = 30;
  light.shadow.camera.bottom = -30;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.position.set(25, 45, 25);
  //const lighthelper = new THREE.DirectionalLightHelper(light, 5);
  //scene.add(lighthelper);

  let gridHelper = new THREE.GridHelper(50, 10);
  scene.add(gridHelper);

  let axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  let world = new CANNON.World();
  world.gravity.set(0, -9.8, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 5;

  // 地面
  addBox({
    shape: { x: 50, y: 0.2, z: 50 },
    position: { x: 0, y: -0.1, z: 0 },
    material: { color: 0xd3d3d3 },
  });

  // 右侧墙壁
  addBox({
    shape: { x: 0.2, y: 4.9, z: 50 },
    position: { x: 24.9, y: 2.5, z: 0 },
    material: { color: 0xd3d3d3 },
  });

  // 左侧墙壁
  addBox({
    shape: { x: 0.2, y: 4.9, z: 50 },
    position: { x: -24.9, y: 2.5, z: 0 },
    material: { color: 0xd3d3d3 },
  });

  // 前侧墙壁
  addBox({
    shape: { x: 50, y: 4.9, z: 0.2 },
    position: { x: 0, y: 2.5, z: 24.9 },
    material: { color: 0xd3d3d3 },
  });

  // 后侧墙壁
  addBox({
    shape: { x: 50, y: 4.9, z: 0.2 },
    position: { x: 0, y: 2.5, z: -24.9 },
    material: { color: 0xd3d3d3 },
  });

  // eslint-disable-next-line no-unused-vars
  let { sphere, sphereBody } = addSphere(0.5, 0x00bfff);

  let keyPressSet = {
    KeyW: {
      status: false,
      time: 0,
      function: () => {
        sphereBody.position.z -= 0.1;
      },
    },
    KeyA: {
      status: false,
      time: 0,
      function: () => {
        sphereBody.position.x -= 0.1;
      },
    },
    KeyS: {
      status: false,
      time: 0,
      function: () => {
        sphereBody.position.z += 0.1;
      },
    },
    KeyD: {
      status: false,
      time: 0,
      function: () => {
        sphereBody.position.x += 0.1;
      },
    },
    Space: {
      status: false,
      time: 0,
      function: () => {
        sphereBody.position.y += 0.1;
      },
    },
  };

  window.addEventListener("keydown", (e) => {
    keyPressSet[e.code].status = true;
  });

  window.addEventListener("keyup", (e) => {
    keyPressSet[e.code].status = false;
  });

  animate();

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
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    return renderer;
  }

  // 初始化环境光
  function initAmbientLight(color) {
    const light = new THREE.AmbientLight(color);
    scene.add(light);
  }

  // 执行渲染
  function animate() {
    Object.keys(keyPressSet).forEach((key) => {
      let keyConfig = keyPressSet[key];
      if (keyConfig.status) keyConfig.function();
    });
    camera.position.set(
      sphereBody.position.x,
      sphereBody.position.y + 10,
      sphereBody.position.z + 10
    );
    updatePhysics();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  // 更新物理引擎
  function updatePhysics() {
    // world.step
    world.step(1 / 60); //第一个参数是以固定步长更新物理世界参数（详情请看api）
    scene.children.forEach((d) => {
      //遍历场景中的子对象，如果对象的isMesh属性为true，我们就将更新改对象的position和quaternion属性（他们对应的刚体数据存在对应的userData中）。
      if (d.isMesh == true) {
        d.position.copy(d.userData.position);
        d.quaternion.copy(d.userData.quaternion);
      }
    });
  }

  // 添加立方体模型与物理刚体
  function addBox(data) {
    // 添加立方体3d模型
    let groundGeometry = new THREE.BoxGeometry(
      data.shape.x,
      data.shape.y,
      data.shape.z
    );
    let groundMaterial = new THREE.MeshLambertMaterial({
      color: data.material.color,
    });
    let ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.castShadow = ground.receiveShadow = true;
    ground.position.set(data.position.x, data.position.y, data.position.z);
    scene.add(ground);

    // 添加立方体物理刚体
    let groundBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(
        data.position.x,
        data.position.y,
        data.position.z
      ),
      shape: new CANNON.Box(
        new CANNON.Vec3(data.shape.x / 2, data.shape.y / 2, data.shape.z / 2)
      ),
      material: new CANNON.Material({ friction: 0.3, restitution: 0.3 }),
    });
    ground.userData = groundBody;
    world.addBody(groundBody);

    return { ground, groundBody };
  }

  // 添加球体模型与物理刚体
  function addSphere(radius, color) {
    // 添加球体3d模型
    var sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
    var sphereMaterial = new THREE.MeshLambertMaterial({ color });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = sphere.receiveShadow = true;
    sphere.position.y = radius / 2;
    scene.add(sphere);

    // 添加球体物理刚体
    let sphereBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, radius / 2, 0),
      shape: new CANNON.Sphere(radius),
      material: new CANNON.Material({ friction: 0.3, restitution: 0.3 }),
    });
    sphere.userData = sphereBody;
    world.addBody(sphereBody);
    return { sphere, sphereBody };
  }
});
</script>

<style lang="scss" scoped>
#container {
  height: 100%;
  width: 100%;
}
</style>
