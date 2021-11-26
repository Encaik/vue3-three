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
  camera.position.set(0, 5, 5);
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

  let planegeometry = new THREE.BoxGeometry(50, 0.2, 50);
  let planematerial = new THREE.MeshLambertMaterial({ color: 0xd3d3d3 });
  let plane = new THREE.Mesh(planegeometry, planematerial);
  plane.castShadow = plane.receiveShadow = true;
  plane.position.y = -0.1;
  scene.add(plane);

  let planeGround = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -0.1, 0),
    shape: new CANNON.Box(new CANNON.Vec3(25, 0.1, 25)),
    material: new CANNON.Material({ friction: 0.05, restitution: 0 }),
  });
  plane.userData = planeGround;
  world.addBody(planeGround);

  let cubegeometry = new THREE.BoxGeometry(1, 1, 1);
  let cubematerial = new THREE.MeshLambertMaterial({ color: 0x00bfff });
  let cube = new THREE.Mesh(cubegeometry, cubematerial);
  cube.castShadow = cube.receiveShadow = true;
  cube.position.set(0, 0.5, 0);
  scene.add(cube);

  let bodyBox = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 0.5, 0),
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
    material: new CANNON.Material({ friction: 0.1, restitution: 0 }),
  });
  cube.userData = bodyBox;
  world.addBody(bodyBox);

  let keyPressSet = {
    w: {
      status: false,
      time: 0,
    },
    a: {
      status: false,
      time: 0,
    },
    s: {
      status: false,
      time: 0,
    },
    d: {
      status: false,
      time: 0,
    },
    space: {
      status: false,
      time: 0,
    },
  };

  window.addEventListener("keydown", (e) => {
    console.log(e);
    switch (e.code) {
      case "KeyD":
        keyPressSet.d.status = true;
        break;
      case "KeyA":
        keyPressSet.a.status = true;
        break;
      case "KeyS":
        keyPressSet.s.status = true;
        break;
      case "KeyW":
        keyPressSet.w.status = true;
        break;
      case "Space":
        keyPressSet.space.status = true;
        break;
      default:
        break;
    }
  });

  window.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "KeyD":
        keyPressSet.d.status = false;
        break;
      case "KeyA":
        keyPressSet.a.status = false;
        break;
      case "KeyS":
        keyPressSet.s.status = false;
        break;
      case "KeyW":
        keyPressSet.w.status = false;
        break;
      case "Space":
        keyPressSet.space.status = false;
        break;
      default:
        break;
    }
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

  function animate() {
    Object.keys(keyPressSet).forEach((key) => {
      switch (key) {
        case "d":
          if (keyPressSet[key].status) {
            bodyBox.position.x += 0.1;
            camera.position.x += 0.1;
          }
          break;
        case "a":
          if (keyPressSet[key].status) {
            bodyBox.position.x -= 0.1;
            camera.position.x -= 0.1;
          }
          break;
        case "s":
          if (keyPressSet[key].status) {
            bodyBox.position.z += 0.1;
            camera.position.z += 0.1;
          }
          break;
        case "w":
          if (keyPressSet[key].status) {
            bodyBox.position.z -= 0.1;
            camera.position.z -= 0.1;
          }
          break;
        case "space":
          if (keyPressSet[key].status) {
            bodyBox.position.y += 0.1;
          }
          break;
        default:
          break;
      }
    });
    updatePhysics();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

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
});
</script>

<style lang="scss" scoped>
#container {
  height: 100%;
  width: 100%;
}
</style>
