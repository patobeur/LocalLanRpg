import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "/node_modules/three/examples/jsm/loaders/FBXLoader.js";

/**
 * Centralized Asset Loader
 * Handles loading of all game assets (GLB, GLTF, FBX) with progress tracking
 */
export class AssetLoader {
    constructor() {
        this.gltfLoader = new GLTFLoader();
        this.fbxLoader = new FBXLoader();
        this.cache = new Map();
        this.pendingLoads = new Map();

        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.callbacks = {
            onProgress: null,
            onComplete: null,
            onError: null
        };
    }

    /**
     * Set progress callback
     */
    onProgress(callback) {
        this.callbacks.onProgress = callback;
    }

    /**
     * Set completion callback
     */
    onComplete(callback) {
        this.callbacks.onComplete = callback;
    }

    /**
     * Set error callback
     */
    onError(callback) {
        this.callbacks.onError = callback;
    }

    /**
     * Load a batch of assets
     * @param {Array} assetList - Array of {type, path, name}
     * @returns {Promise}
     */
    async loadAssets(assetList) {
        this.totalAssets = assetList.length;
        this.loadedAssets = 0;

        const promises = assetList.map(asset => this.loadAsset(asset));

        try {
            await Promise.all(promises);
            if (this.callbacks.onComplete) {
                this.callbacks.onComplete();
            }
        } catch (error) {
            console.error('[AssetLoader] Error loading assets:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        }
    }

    /**
     * Load a single asset
     * @param {Object} asset - {type, path, name}
     */
    async loadAsset({ type, path, name }) {
        // Check cache
        if (this.cache.has(name)) {
            this.loadedAssets++;
            this.notifyProgress();
            return this.cache.get(name);
        }

        // Check pending
        if (this.pendingLoads.has(name)) {
            return this.pendingLoads.get(name);
        }

        // Start load
        const promise = new Promise((resolve, reject) => {
            const loader = type === 'fbx' ? this.fbxLoader : this.gltfLoader;

            loader.load(
                path,
                (result) => {
                    const model = type === 'fbx' ? result : result.scene;
                    this.cache.set(name, model);
                    this.loadedAssets++;
                    this.notifyProgress();
                    resolve(model);
                },
                undefined,
                (error) => {
                    console.error(`[AssetLoader] Failed to load ${name}:`, error);
                    reject(error);
                }
            );
        });

        this.pendingLoads.set(name, promise);

        try {
            const result = await promise;
            this.pendingLoads.delete(name);
            return result;
        } catch (error) {
            this.pendingLoads.delete(name);
            throw error;
        }
    }

    /**
     * Notify progress callback
     */
    notifyProgress() {
        if (this.callbacks.onProgress) {
            const progress = this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 0;
            this.callbacks.onProgress({
                loaded: this.loadedAssets,
                total: this.totalAssets,
                progress: progress
            });
        }
    }

    /**
     * Get cached model (returns a clone)
     * @param {string} name
     */
    getModel(name) {
        const cached = this.cache.get(name);
        return cached ? cached.clone() : null;
    }

    /**
     * Check if asset is loaded
     */
    isLoaded(name) {
        return this.cache.has(name);
    }
}

// Singleton instance
export const assetLoader = new AssetLoader();
