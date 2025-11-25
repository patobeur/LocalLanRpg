import * as THREE from "/node_modules/three/build/three.module.js";

export const scene = new THREE.Scene();
export const world = new THREE.Group();
export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
export const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("c"),
    antialias: true,
});

const gridSize = 40;
const camSize = 8;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let planeMesh = null;

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
    planeMesh = plane;
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
}

function updateCameraProjection() {
    const aspect = innerWidth / innerHeight;
    camera.left = -camSize * aspect;
    camera.right = camSize * aspect;
    camera.top = camSize;
    camera.bottom = -camSize;
    camera.updateProjectionMatrix();
}

export function updateCameraPosition(x, z) {
    camera.position.x = x;
    camera.position.z = z + 0.01;
    camera.lookAt(x, 0, z);
}

export function makePlayerMesh(hexColor) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12),
        new THREE.MeshStandardMaterial({
            color: new THREE.Color(hexColor),
        })
    );
    body.position.y = 0.45;
    g.add(body);
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    head.position.y = 1.1;
    g.add(head);
    const dir = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.3, 10),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    dir.rotation.x = Math.PI;
    dir.position.set(0, 1.1, 0.35);
    g.add(dir);
    return g;
}

export function render() {
    renderer.render(scene, camera);
}

export function getGroundIntersection(clientX, clientY) {
    if (!planeMesh) return null;
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeMesh);
    if (intersects.length > 0) {
        return intersects[0].point;
    }
    return null;
}

export function getPlayerIntersection(clientX, clientY, playersMap) {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const meshes = Array.from(playersMap.values());
    // Raycast recursively because players are Groups
    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
        // Find which player group this mesh belongs to
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== world) {
            obj = obj.parent;
        }
        // Find the ID associated with this mesh
        for (const [id, mesh] of playersMap.entries()) {
            if (mesh === obj) {
                return { id, point: intersects[0].point };
            }
        }
    }
    return null;
}

export function clearPlayers(meshes) {
    meshes.forEach((mesh) => {
        world.remove(mesh);
    });
}
