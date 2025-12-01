import { camera } from "./core.js";

export function updateCameraPosition(x, z) {
    camera.position.x = x;
    camera.position.z = z + 8;
    camera.lookAt(x, 0, z);
}
