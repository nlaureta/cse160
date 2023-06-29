import * as THREE from 'three';
import { OBJLoader } from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from './three.js-master/examples/jsm/loaders/MTLLoader.js';
import { GUI } from './three.js-master/examples/jsm/libs/lil-gui.module.min.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  //renderer.outputEncoding = THREE.sRGBEncoding;

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  //camera.position.set(0, 10, 2);
  camera.position.z = 3;

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  //scene.background = new THREE.Color('black');

  //background sound
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const bgSound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('sounds/cricketSounds.mp3', function (buffer) {
    bgSound.setBuffer(buffer);
    bgSound.setLoop(true);
    bgSound.setVolume(0.5);
    //bgSound.resume();
    bgSound.play();
  })

  const planeSize = 4000;

  const loader = new THREE.TextureLoader();
  //const loader2 = new THREE.TextureLoader();

  const bgTexture = loader.load('resources/images/galaxySky3.jpg', () => {
    const rt = new THREE.WebGLCubeRenderTarget(bgTexture.image.height);
    rt.fromEquirectangularTexture(renderer, bgTexture);
    scene.background = rt.texture;
    //scene.background = bgTexture;
  });
  //scene.background = bgTexture;
  // const bgTexture = loader.load('resources/images/skyNight2.png');
  // scene.background = bgTexture;
  const texture = loader.load('resources/images/Grass_Ground_Texture.jpg');
  texture.encoding = THREE.sRGBEncoding;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 200;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  //planeMat.color.setRGB(1.5, 1.5, 1.5);
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.receiveShadow = true;
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);

  // lighting - ambient, directional, spotlight, pointlight
  {
    const color = 0xFFFFFF;
    const intensity = .2;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
  }
  {
    const color = 0xFFFFFF;
    const intensity = 0.1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 1001, 2);
    //light.castShadow = true;
    scene.add(light);
    scene.add(light.target);
  }
  //hemisphere
  {
    const skyColor = 0x613659;  // light blue
    const groundColor = 0x00FF00;  // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }
  //point

  const color = 0xFFA500;
  const intensity = 3;
  const firelight = new THREE.PointLight(color, intensity);
  firelight.position.set(0, 50, 0);
  firelight.scale.set(10, 10, 10);
  firelight.castShadow = true;
  const helper = new THREE.PointLightHelper(firelight);
  //scene.add(helper);
  scene.add(firelight);
  //spotlight
  {
    const color = 0xFFFF00;
    const intensity = 8;
    var fLight = new THREE.SpotLight(color, intensity, 0, .3);
    fLight.position.set(-200, 10, -100)
    fLight.target.position.set(-220, 0, 2900);
    fLight.castShadow = true;

    //Set up shadow properties for the light
    fLight.shadow.mapSize.width = 512; // default
    fLight.shadow.mapSize.height = 512; // default
    fLight.shadow.camera.near = 0.5; // default
    fLight.shadow.camera.far = 500; // default
    fLight.shadow.focus = 1; // default

    const helper = new THREE.SpotLightHelper(fLight);
    scene.add(fLight);
    scene.add(fLight.target);
    //scene.add(helper);

    function updateLight() {
      fLight.target.updateMatrixWorld();
      //fLight.shadow.camera.updateProjectionMatrix();
      helper.update();
    }
    updateLight();
    //setTimeout(updateLight);
  }
  //fog
  {
    const near = 200;
    const far = 5000;
    const color = 'lightblue';
    scene.fog = new THREE.Fog(color, near, far);
    scene.background = new THREE.Color(color);
  }

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // from the center of the box
    const direction = (new THREE.Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }
  //tent
  {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    mtlLoader.load('resources/obj/Tent/uploads_files_4044517_untitled.mtl', (mtl) => {
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load('resources/obj/Tent/uploads_files_4044517_untitled.obj', (root) => {
        scene.add(root);
        root.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        })
        root.scale.set(100, 100, 100)
        // root.rotateX(-8);
        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // set the camera to frame the box
        frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();
      });
    });


  }
  //trees
  {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    for (let x = -19; x < 19; x++) {
      for (let z = -19; z < 19; z++) {
        if (((x < -8 || x > 8) || (z < -6 || z > 6)) && ((x < -2 || x > 2))) {
          mtlLoader.load('resources/obj/Tree/LPTree1.mtl', (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            mtl.materials.leaves_color_LPTree1.side = THREE.DoubleSide;
            objLoader.load('resources/obj/Tree/LowPoly_Tree_v1.obj', (Tree) => {
              Tree.translateX(x * (10 + 100));
              Tree.translateZ(z * (10 + 100));
              Tree.scale.set(2 + Math.random(), 2 + Math.random(), 2 + Math.random())
              Tree.rotateX(-8);
              Tree.castShadow = true;
              Tree.receiveShadow = true;
              scene.add(Tree);

            });
          });
        }
        else if (!(x < -6 || x > 6) && z < -6) {
          mtlLoader.load('resources/obj/Tree/LPTree1.mtl', (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load('resources/obj/Tree/LowPoly_Tree_v1.obj', (Tree) => {
              Tree.translateX(x * (10 + 100));
              Tree.translateZ(z * (10 + 100));
              Tree.scale.set(2 + Math.random(), 2 + Math.random(), 2 + Math.random())
              Tree.rotateX(-8);
              scene.add(Tree);

            });
          });
        }
      }
    }
  }
  //bonfire
  {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    mtlLoader.load('resources/obj/Campfire/Bonfire model 1.mtl', (mtl) => {
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load('resources/obj/Campfire/Bonfire model 1.obj', (bonfire) => {
        scene.add(bonfire);
        bonfire.scale.set(65, 65, 65)
      });
    });
  }
  //flashlight
  {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    mtlLoader.load('resources/obj/Flashlight/Flashlight.mtl', (mtl) => {
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load('resources/obj/Flashlight/Flashlight.obj', (flashlight) => {
        scene.add(flashlight);
        flashlight.scale.set(5, 5, 5)
        flashlight.translateY(7);
        flashlight.translateX(-200);
        flashlight.translateZ(-100);
      });
    });
  }
  //bear
  // {
  //   const mtlLoader = new MTLLoader();
  //   const objLoader = new OBJLoader();
  //   mtlLoader.load('resources/obj/Bear/bear.mtl', (mtl) => {
  //     mtl.preload();
  //     objLoader.setMaterials(mtl);
  //     objLoader.load('resources/obj/Bear/bear.obj', (bear) => {
  //       scene.add(bear);
  //       bear.traverse(function (node) {
  //         if (node.isMesh) {
  //           node.castShadow = true;
  //         }
  //       })
  //       bear.scale.set(45, 45, 45)
  //       bear.translateY(95);
  //       bear.translateX(-160);
  //       bear.translateZ(408);
  //       bear.rotateY(180);
  //     });
  //   });
  // }
  //fireflies
  let fireflies = [];
  for (let i = 1; i < 4; i++) {
    for (let j = -10; j < 3; j++) {
      const radius = 3;
      const width = 32;
      const height = 16;
      const sphereGeometry = new THREE.SphereGeometry(radius, width, height);
      const sphereM = new THREE.MeshPhongMaterial({ color: '#CA8' });
      const firefly = new THREE.Mesh(sphereGeometry, sphereM);
      firefly.castShadow = true;
      firefly.receiveShadow = true;
      firefly.translateX(Math.random() * 200 * i);
      firefly.translateZ(Math.random() * 200 * j);
      firefly.translateY((Math.random() * 70 * i) + 100);
      firefly.scale.set(1, 1, 1);
      scene.add(firefly);
      fireflies.push(firefly);
    }
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= .001;
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    firelight.position.y += Math.sin(time * 6) / 2;
    for (let i = 0; i < fireflies.length; i++) {
      if (i % 2 == 0) {
        fireflies[i].position.y += Math.sin(time * 6.1) / 2;
        //firefliesLight[i].position.y += Math.sin(time * 6.1) / 2;
      } else {
        fireflies[i].position.y += Math.sin(time * 3.3) / 2;
        //firefliesLight[i].position.y += Math.sin(time * 3.3) / 2;

      }
      //firefliesLight[i].intensity  = Math.random() * .06;
    }


    // Set the repeat and offset properties of the background texture
    // to keep the image's aspect correct.
    // Note the image may not have loaded yet.
    // const canvasAspect = canvas.clientWidth / canvas.clientHeight;
    // const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
    // const aspect = imageAspect / canvasAspect;

    // bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
    // bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;

    // bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
    // bgTexture.repeat.y = aspect > 1 ? 1 : aspect;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();