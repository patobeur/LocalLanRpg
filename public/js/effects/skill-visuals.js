
import * as THREE from "/node_modules/three/build/three.module.js";
import { world } from "../scene.js";

// Helper: Remove Object after delay
function removeAfter(obj, seconds) {
    setTimeout(() => {
        if (obj.parent) obj.parent.remove(obj);
        // shallow dispose
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
        }
    }, seconds * 1000);
}

// Helper: Create Expanding Sphere (Explosion/Nova)
function createExpandingSphere(pos, color, startRadius, endRadius, duration) {
    const geo = new THREE.SphereGeometry(1, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        emissive: color,
        emissiveIntensity: 1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.scale.set(startRadius, startRadius, startRadius);
    world.add(mesh);

    const startTime = performance.now();
    const animate = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed > duration) {
            world.remove(mesh);
            return;
        }
        const progress = elapsed / duration;
        const currentR = startRadius + (endRadius - startRadius) * progress;
        mesh.scale.set(currentR, currentR, currentR);
        mat.opacity = 0.6 * (1 - progress);
        requestAnimationFrame(animate);
    };
    animate();
}

// Helper: Create Ground Circle (Zone)
function createGroundCircle(pos, color, radius, duration) {
    const geo = new THREE.CircleGeometry(radius, 32);
    const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos.x, 0.1, pos.z); // Slightly above ground
    world.add(mesh);

    // Fade out at end
    removeAfter(mesh, duration);
}

// Helper: Create Moving Projectile
function createLinearProjectile(startPos, endPos, speed, meshBuilder, onHit) {
    const dist = startPos.distanceTo(endPos);
    const duration = dist / (speed * 20); // Speed scaling?
    // Note: server sends 'speed' already scaled usually, but here we get raw description.
    // Let's assume duration is passed or calced.

    const mesh = meshBuilder();
    mesh.position.copy(startPos);
    mesh.lookAt(endPos);
    world.add(mesh);

    const startTime = performance.now();
    const animate = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed >= duration) {
            // Hit
            world.remove(mesh);
            if (onHit) onHit();
            return;
        }
        const progress = elapsed / duration;
        mesh.position.lerpVectors(startPos, endPos, progress);
        requestAnimationFrame(animate);
    };
    animate();
}

/**
 * Main Entry Point for Skill Visuals
 * @param {string|number} skillId 
 * @param {object} data - { x, y, z, targetX, targetZ, targetId, shooterId }
 */
export function playSkillEffect(skillId, data) {
    const startPos = new THREE.Vector3(data.x, data.y, data.z);

    // Determine Target Pos
    let targetPos = new THREE.Vector3(data.targetX || data.x, data.y, data.targetZ || data.z);
    // If targetID provided, we might want to attach, but for now linear to point is fine.

    // 0: Blood Ball
    if (skillId == 0) {
        // Red Sphere Projectile
        createLinearProjectile(
            startPos,
            targetPos,
            1.1, // speed
            () => {
                const g = new THREE.SphereGeometry(0.2);
                const m = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x550000 });
                return new THREE.Mesh(g, m);
            },
            () => {
                // On Hit
                createExpandingSphere(targetPos, 0xff0000, 0.2, 1.5, 0.5);
            }
        );
    }
    // 1: Fire Zone
    else if (skillId == 1) {
        // Instant Ground Circle
        createGroundCircle(targetPos, 0xff4400, 2.5, 5);
        // Could add particle fire effect here
    }
    // 2: Self Heal
    else if (skillId == 2) {
        createExpandingSphere(startPos, 0x00ff00, 0.5, 1.2, 1.0);
    }
    // 3: Self Heal Area
    else if (skillId == 3) {
        // Rain effect - Simplified as cylinder for now
        const g = new THREE.CylinderGeometry(1.2, 1.2, 3, 16, 1, true);
        const m = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(startPos.x, startPos.y + 1.5, startPos.z);
        world.add(mesh);
        removeAfter(mesh, 1.0);
    }
    // 4: Group Heal Target
    else if (skillId == 4) {
        // Halo on target
        const g = new THREE.TorusGeometry(0.5, 0.05, 8, 16);
        const m = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const mesh = new THREE.Mesh(g, m);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(targetPos.x, targetPos.y + 2, targetPos.z);
        world.add(mesh);
        removeAfter(mesh, 5.0);
    }
    // 5: Group Heal Floor
    else if (skillId == 5) {
        createGroundCircle(targetPos, 0x00ff88, 7.5, 5);
    }
    // 6: Pics de glace
    else if (skillId == 6) {
        // Spike
        const g = new THREE.ConeGeometry(0.4, 2, 4);
        const m = new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.1 });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(targetPos.x, 0, targetPos.z); // rise from ground
        world.add(mesh);

        // Rise animation
        const startY = -1;
        const endY = 1;
        const startTime = performance.now();
        const anim = () => {
            const t = (performance.now() - startTime) / 100; // 0.1s rise
            if (t > 1) {
                mesh.position.y = endY;
                removeAfter(mesh, 2.0);
                return;
            }
            mesh.position.y = startY + (endY - startY) * t;
            requestAnimationFrame(anim);
        };
        anim();
    }
    // 7: Chain Lightning
    else if (skillId == 7) {
        // Simple Line
        const pts = [startPos, targetPos];
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        const m = new THREE.LineBasicMaterial({ color: 0x00ffff });
        const line = new THREE.Line(g, m);
        world.add(line);
        removeAfter(line, 0.2);
    }
    // 8: Dague
    else if (skillId == 8) {
        createLinearProjectile(
            startPos, targetPos, 1.4,
            () => new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5), new THREE.MeshBasicMaterial({ color: 0x990099 })),
            () => createExpandingSphere(targetPos, 0x990099, 0.1, 0.5, 0.3)
        );
    }
    // 9: Poison Arrow
    else if (skillId == 9) {
        createLinearProjectile(
            startPos, targetPos, 1.8,
            () => new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), new THREE.MeshBasicMaterial({ color: 0x00ff00 })),
            () => createExpandingSphere(targetPos, 0x00ff00, 0.2, 1.0, 0.5)
        );
    }
    // 10: Vortex
    else if (skillId == 10) {
        // Cone
        const g = new THREE.ConeGeometry(2, 3, 16, 1, true);
        const m = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(targetPos.x, 1.5, targetPos.z);
        mesh.rotation.x = Math.PI; // Inverted
        world.add(mesh);

        const startTime = performance.now();
        const spin = () => {
            if (!mesh.parent) return; // removed
            mesh.rotation.y += 0.1;
            requestAnimationFrame(spin);
        };
        spin();
        removeAfter(mesh, 3.0);
    }
    // 11: Shield
    else if (skillId == 11) {
        const g = new THREE.IcosahedronGeometry(1);
        const m = new THREE.MeshBasicMaterial({ color: 0xaa00ff, wireframe: true });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.copy(startPos);
        world.add(mesh);
        // Attach? For now static at cast pos or we need player mesh reference which we don't have purely from ID
        // Simplified: static
        removeAfter(mesh, 5.0);
    }
    // 12: Time Stop
    else if (skillId == 12) {
        createGroundCircle(targetPos, 0xccaaff, 4, 1.5);
    }
    // 13: Meteor
    else if (skillId == 13) {
        // Dash? We just show impact for now
        createExpandingSphere(targetPos, 0xffaa00, 0.5, 3.0, 0.5);
    }
    // 14: Sacred Heal
    else if (skillId == 14) {
        const g = new THREE.CylinderGeometry(4, 4, 20, 32, 1, true);
        const m = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(targetPos.x, 10, targetPos.z);
        world.add(mesh);
        removeAfter(mesh, 6.0);
    }
    else {
        console.log("Unknown visual for skill", skillId);
    }
}
