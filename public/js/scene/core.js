import * as THREE from "/node_modules/three/build/three.module.js";
import { GAME_CONSTANTS } from "../client-config.js";

export const scene = new THREE.Scene();
export const world = new THREE.Group();
export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
export const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("c"),
    antialias: true,
});

// Constants are fetched from server via GAME_CONSTANTS
// Access via GAME_CONSTANTS.GRID_SIZE and GAME_CONSTANTS.CAMERA

let currentZoom = GAME_CONSTANTS.CAMERA?.ZOOM_SCALE || 100;

function handleZoom(delta) {
    currentZoom += delta * (GAME_CONSTANTS.CAMERA?.ZOOM_SPEED || 0.1) * -1; // Invert delta for intuitive zoom
    currentZoom = Math.max(
        GAME_CONSTANTS.CAMERA?.MIN_ZOOM || 20,
        Math.min(GAME_CONSTANTS.CAMERA?.MAX_ZOOM || 150, currentZoom)
    );
    updateCameraProjection();
}

function updateCameraProjection() {
    const aspect = innerWidth / innerHeight;
    const viewSize = innerHeight / currentZoom;

    camera.left = -viewSize * aspect;
    camera.right = viewSize * aspect;
    camera.top = viewSize;
    camera.bottom = -viewSize;
    camera.updateProjectionMatrix();
}

export function initScene() {
    scene.background = new THREE.Color(0x0b1020);
    scene.add(world);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(2, 3, 1);
    scene.add(dl);

    // Load floor texture
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load('/media/floors/floor.png');

    // Configure texture for tiling
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1); // Adjust repetition based on grid size

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(
            GAME_CONSTANTS.GRID_SIZE?.x || 60,
            GAME_CONSTANTS.GRID_SIZE?.y || 60
        ),
        new THREE.MeshStandardMaterial({
            map: floorTexture,
            side: THREE.DoubleSide
        })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.userData.isGroundPlane = true; // Mark as ground plane for raycasting module
    world.add(plane);
    // world.add(new THREE.GridHelper(gridSize.x, gridSize.y, 0x335, 0x224));

    renderer.setSize(innerWidth, innerHeight);
    updateCameraProjection();

    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);

    addEventListener("resize", () => {
        updateCameraProjection();
        renderer.setSize(innerWidth, innerHeight);
    });

    // Zoom listeners
    addEventListener("wheel", (e) => {
        handleZoom(e.deltaY);
    });

    addEventListener("keydown", (e) => {
        if (e.key === "+" || e.key === "=") {
            // = is often on the same key as +
            handleZoom(-100); // Zoom in
        } else if (e.key === "-" || e.key === "_") {
            handleZoom(100); // Zoom out
        }
    });
}
