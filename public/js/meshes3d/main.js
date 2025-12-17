
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { categories, animConfig, animBasePaths } from "./data.js";
import * as Viewer from "./viewer.js";
import * as UI from "./ui.js";

// State
let currentCategory = "Personnages";
let currentModel = null;
let mixer = null;
let actions = {}; // Map name -> AnimationAction
let activeAction = null;

// Initialize
function init() {
    Viewer.initThree('canvas-container', animateUpdate);
    UI.initUI(categories, switchCategory);

    // Initial Load
    switchCategory(Object.keys(categories)[0]);
}

function animateUpdate(delta) {
    if (mixer) mixer.update(delta);
}

// --- Logic ---

function switchCategory(category) {
    currentCategory = category;
    UI.updateTabStatus(category);
    UI.renderModelList(categories[category], loadModel);
}

function loadModel(item, uiElement) {
    UI.updateModelListActiveState(uiElement);
    UI.setLoadingVisible(true);

    // Cleanup
    if (currentModel) {
        Viewer.scene.remove(currentModel);
        currentModel = null;
    }
    if (mixer) {
        mixer.stopAllAction();
        mixer = null;
    }
    actions = {};
    activeAction = null;
    UI.clearAnimControls();

    // Load Base Model
    const isFbx = item.path.toLowerCase().endsWith('.fbx');
    const loader = isFbx ? new FBXLoader() : new GLTFLoader();

    loader.load(item.path, (object) => {
        const model = isFbx ? object : object.scene;
        currentModel = model;

        // Scale & Center
        model.scale.set(1, 1, 1);
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        let scaleFactor = 1;
        if (isFbx) {
            if (maxDim > 100) scaleFactor = 0.01;
        } else {
            if (maxDim > 5) scaleFactor = 0.5;
        }

        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        new THREE.Box3().setFromObject(model).getCenter(center);
        model.position.sub(center);
        model.position.y = 0;
        Viewer.scene.add(model);

        // --- Animation Setup ---
        mixer = new THREE.AnimationMixer(model);

        // 1. Integrated Animations
        const rawAnims = isFbx ? object.animations : object.animations; // GLTF also has animations on object usually or object.animations
        if (rawAnims && rawAnims.length > 0) {
            const clip = rawAnims[0];
            const action = mixer.clipAction(clip);
            actions['Idle'] = action;
            const btn = UI.createAnimButton('Idle', () => playAction('Idle'), true);
            btn.classList.add('active'); // Auto-active logic
            action.play();
            activeAction = action;
        }

        // 2. External Animations
        const neededAnims = animConfig[currentCategory] || [];
        const basePath = animBasePaths[currentCategory];

        if (basePath && neededAnims.length > 0) {
            neededAnims.forEach(animConf => {
                // Create gray button
                const btn = UI.createAnimButton(animConf.name, null, false);

                let filename = `${item.id}${animConf.suffix}`;
                const fullPath = basePath + filename;

                loadExternalAnimation(fullPath, animConf.name, btn);
            });
        } else {
            if (!actions['Idle']) {
                UI.showNoAnimMessage(true);
            }
        }

        UI.setLoadingVisible(false);
    }, undefined, (error) => {
        console.error("Error loading model:", error);
        UI.setLoadingVisible(false);
        alert("Erreur de chargement du modèle.");
    });
}

function loadExternalAnimation(path, name, button) {
    const loader = new FBXLoader();
    loader.load(path, (object) => {
        if (object.animations && object.animations.length > 0) {
            const clip = object.animations[0];
            const action = mixer.clipAction(clip);
            actions[name] = action;

            // Enable button
            UI.activateAnimButton(button, () => playAction(name));
        }
    }, undefined, (err) => {
        // console.warn(`[Anim] ${name} not found at ${path}`, err);
    });
}

function playAction(name) {
    if (!mixer || !actions[name]) return;
    const action = actions[name];

    if (activeAction && activeAction !== action) {
        activeAction.fadeOut(0.2);
    }

    if (activeAction !== action) {
        action.reset().fadeIn(0.2).play();
        activeAction = action;
    }
}

// Start
init();
