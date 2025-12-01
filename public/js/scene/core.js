import * as THREE from "/node_modules/three/build/three.module.js";

export const scene = new THREE.Scene();
export const world = new THREE.Group();
export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
export const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("c"),
    antialias: true,
});

const gridSize = 60;
let ZOOM_SCALE = 100;
const MIN_ZOOM = 20;
const MAX_ZOOM = 150;
const ZOOM_SPEED = 0.1;

function handleZoom(delta) {
    ZOOM_SCALE += delta * ZOOM_SPEED * -1; // Invert delta for intuitive zoom
    ZOOM_SCALE = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, ZOOM_SCALE));
    updateCameraProjection();
}

function updateCameraProjection() {
    const aspect = innerWidth / innerHeight;
    const viewSize = innerHeight / ZOOM_SCALE;

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

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(gridSize, gridSize),
        new THREE.MeshStandardMaterial({ color: 0x0d1527 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.userData.isGroundPlane = true; // Mark as ground plane for raycasting module
    world.add(plane);
    world.add(new THREE.GridHelper(gridSize, gridSize, 0x335, 0x224));

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
