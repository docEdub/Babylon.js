import type { Scene } from "../scene";
import type { AbstractMesh } from "../Meshes/abstractMesh";
import type { TransformNode } from "../Meshes/transformNode";
import type { IParticleSystem } from "../Particles/IParticleSystem";
import type { Skeleton } from "../Bones/skeleton";
import { SceneLoader, SceneLoaderAnimationGroupLoadingMode } from "../Loading/sceneLoader";
import { Tools } from "./tools";
import { Observable } from "./observable";
import type { BaseTexture } from "../Materials/Textures/baseTexture";
import { Texture } from "../Materials/Textures/texture";
import { CubeTexture } from "../Materials/Textures/cubeTexture";
import { HDRCubeTexture } from "../Materials/Textures/hdrCubeTexture";
import { EquiRectangularCubeTexture } from "../Materials/Textures/equiRectangularCubeTexture";
import { Logger } from "../Misc/logger";
import type { Animatable } from "../Animations/animatable.core";
import type { AnimationGroup } from "../Animations/animationGroup";
import type { AssetContainer } from "../assetContainer";
import { EngineStore } from "../Engines/engineStore";
import type { Nullable } from "../types";

/**
 * Defines the list of states available for a task inside a AssetsManager
 */
export const enum AssetTaskState {
    /**
     * Initialization
     */
    INIT,
    /**
     * Running
     */
    RUNNING,
    /**
     * Done
     */
    DONE,
    /**
     * Error
     */
    ERROR,
}

/**
 * Define an abstract asset task used with a AssetsManager class to load assets into a scene
 */
export abstract class AbstractAssetTask {
    /**
     * Callback called when the task is successful
     */
    public onSuccess: (task: any) => void;

    /**
     * Callback called when the task is not successful
     */
    public onError: (task: any, message?: string, exception?: any) => void;

    /**
     * Creates a new AssetsManager
     * @param name defines the name of the task
     */
    constructor(
        /**
         * Task name
         */ public name: string
    ) {}

    private _isCompleted = false;
    private _taskState = AssetTaskState.INIT;
    private _errorObject: { message?: string; exception?: any };

    /**
     * Get if the task is completed
     */
    public get isCompleted(): boolean {
        return this._isCompleted;
    }

    /**
     * Gets the current state of the task
     */
    public get taskState(): AssetTaskState {
        return this._taskState;
    }

    /**
     * Gets the current error object (if task is in error)
     */
    public get errorObject(): { message?: string; exception?: any } {
        return this._errorObject;
    }

    /**
     * Internal only
     * @internal
     */
    public _setErrorObject(message?: string, exception?: any) {
        if (this._errorObject) {
            return;
        }

        this._errorObject = {
            message: message,
            exception: exception,
        };
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public run(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        this._taskState = AssetTaskState.RUNNING;
        this.runTask(
            scene,
            () => {
                this._onDoneCallback(onSuccess, onError);
            },
            (msg, exception) => {
                this._onErrorCallback(onError, msg, exception);
            }
        );
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        throw new Error("runTask is not implemented");
    }

    /**
     * Reset will set the task state back to INIT, so the next load call of the assets manager will execute this task again.
     * This can be used with failed tasks that have the reason for failure fixed.
     */
    public reset() {
        this._taskState = AssetTaskState.INIT;
    }

    private _onErrorCallback(onError: (message?: string, exception?: any) => void, message?: string, exception?: any) {
        this._taskState = AssetTaskState.ERROR;

        this._errorObject = {
            message: message,
            exception: exception,
        };

        if (this.onError) {
            this.onError(this, message, exception);
        }

        onError();
    }

    private _onDoneCallback(onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        try {
            this._taskState = AssetTaskState.DONE;
            this._isCompleted = true;

            if (this.onSuccess) {
                this.onSuccess(this);
            }

            onSuccess();
        } catch (e) {
            this._onErrorCallback(onError, "Task is done, error executing success callback(s)", e);
        }
    }
}

/**
 * Define the interface used by progress events raised during assets loading
 */
export interface IAssetsProgressEvent {
    /**
     * Defines the number of remaining tasks to process
     */
    remainingCount: number;
    /**
     * Defines the total number of tasks
     */
    totalCount: number;
    /**
     * Defines the task that was just processed
     */
    task: AbstractAssetTask;
}

/**
 * Class used to share progress information about assets loading
 */
export class AssetsProgressEvent implements IAssetsProgressEvent {
    /**
     * Defines the number of remaining tasks to process
     */
    public remainingCount: number;
    /**
     * Defines the total number of tasks
     */
    public totalCount: number;
    /**
     * Defines the task that was just processed
     */
    public task: AbstractAssetTask;

    /**
     * Creates a AssetsProgressEvent
     * @param remainingCount defines the number of remaining tasks to process
     * @param totalCount defines the total number of tasks
     * @param task defines the task that was just processed
     */
    constructor(remainingCount: number, totalCount: number, task: AbstractAssetTask) {
        this.remainingCount = remainingCount;
        this.totalCount = totalCount;
        this.task = task;
    }
}

/**
 * Define a task used by AssetsManager to load assets into a container
 */
export class ContainerAssetTask extends AbstractAssetTask {
    /**
     * Get the loaded asset container
     */
    public loadedContainer: AssetContainer;
    /**
     * Gets the list of loaded transforms
     */
    public loadedTransformNodes: Array<TransformNode>;
    /**
     * Gets the list of loaded meshes
     */
    public loadedMeshes: Array<AbstractMesh>;
    /**
     * Gets the list of loaded particle systems
     */
    public loadedParticleSystems: Array<IParticleSystem>;
    /**
     * Gets the list of loaded skeletons
     */
    public loadedSkeletons: Array<Skeleton>;
    /**
     * Gets the list of loaded animation groups
     */
    public loadedAnimationGroups: Array<AnimationGroup>;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: ContainerAssetTask) => void;

    /**
     * Callback called when the task is successful
     */
    public override onError: (task: ContainerAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new ContainerAssetTask
     * @param name defines the name of the task
     * @param meshesNames defines the list of mesh's names you want to load
     * @param rootUrl defines the root url to use as a base to load your meshes and associated resources
     * @param sceneFilename defines the filename or File of the scene to load from
     * @param extension defines the extension to use to load the scene (if not defined, ".babylon" will be used)
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the list of mesh's names you want to load
         */
        public meshesNames: any,
        /**
         * Defines the root url to use as a base to load your meshes and associated resources
         */
        public rootUrl: string,
        /**
         * Defines the filename or File of the scene to load from
         */
        public sceneFilename: string | File,
        /**
         * Defines the extension to use to load the scene (if not defined, ".babylon" will be used)
         */
        public extension?: string
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        SceneLoader.LoadAssetContainer(
            this.rootUrl,
            this.sceneFilename,
            scene,
            (container: AssetContainer) => {
                this.loadedContainer = container;
                this.loadedMeshes = container.meshes;
                this.loadedTransformNodes = container.transformNodes;
                this.loadedParticleSystems = container.particleSystems;
                this.loadedSkeletons = container.skeletons;
                this.loadedAnimationGroups = container.animationGroups;
                onSuccess();
            },
            null,
            (scene, message, exception) => {
                onError(message, exception);
            },
            this.extension
        );
    }
}

/**
 * Define a task used by AssetsManager to load meshes
 */
export class MeshAssetTask extends AbstractAssetTask {
    /**
     * Gets the list of loaded transforms
     */
    public loadedTransformNodes: Array<TransformNode>;
    /**
     * Gets the list of loaded meshes
     */
    public loadedMeshes: Array<AbstractMesh>;
    /**
     * Gets the list of loaded particle systems
     */
    public loadedParticleSystems: Array<IParticleSystem>;
    /**
     * Gets the list of loaded skeletons
     */
    public loadedSkeletons: Array<Skeleton>;
    /**
     * Gets the list of loaded animation groups
     */
    public loadedAnimationGroups: Array<AnimationGroup>;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: MeshAssetTask) => void;

    /**
     * Callback called when the task is successful
     */
    public override onError: (task: MeshAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new MeshAssetTask
     * @param name defines the name of the task
     * @param meshesNames defines the list of mesh's names you want to load
     * @param rootUrl defines the root url to use as a base to load your meshes and associated resources
     * @param sceneFilename defines the filename or File of the scene to load from
     * @param extension defines the extension to use to load the scene (if not defined, ".babylon" will be used)
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the list of mesh's names you want to load
         */
        public meshesNames: any,
        /**
         * Defines the root url to use as a base to load your meshes and associated resources
         */
        public rootUrl: string,
        /**
         * Defines the filename or File of the scene to load from
         */
        public sceneFilename: string | File,
        /**
         * Defines the extension to use to load the scene (if not defined, ".babylon" will be used)
         */
        public extension?: string
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        SceneLoader.ImportMesh(
            this.meshesNames,
            this.rootUrl,
            this.sceneFilename,
            scene,
            (meshes: AbstractMesh[], particleSystems: IParticleSystem[], skeletons: Skeleton[], animationGroups: AnimationGroup[], transformNodes: TransformNode[]) => {
                this.loadedMeshes = meshes;
                this.loadedTransformNodes = transformNodes;
                this.loadedParticleSystems = particleSystems;
                this.loadedSkeletons = skeletons;
                this.loadedAnimationGroups = animationGroups;
                onSuccess();
            },
            null,
            (scene, message, exception) => {
                onError(message, exception);
            },
            this.extension
        );
    }
}

/**
 * Define a task used by AssetsManager to load animations
 */
export class AnimationAssetTask extends AbstractAssetTask {
    /**
     * Gets the list of loaded animation groups
     */
    public loadedAnimationGroups: Array<AnimationGroup>;
    /**
     * Gets the list of loaded animatables
     */
    public loadedAnimatables: Array<Animatable>;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: AnimationAssetTask) => void;

    /**
     * Callback called when the task is successful
     */
    public override onError: (task: AnimationAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new AnimationAssetTask
     * @param name defines the name of the task
     * @param rootUrl defines the root url to use as a base to load your meshes and associated resources
     * @param filename defines the filename or File of the scene to load from
     * @param targetConverter defines a function used to convert animation targets from loaded scene to current scene (default: search node by name)
     * @param extension defines the extension to use to load the scene (if not defined, ".babylon" will be used)
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the root url to use as a base to load your meshes and associated resources
         */
        public rootUrl: string,
        /**
         * Defines the filename to load from
         */
        public filename: string | File,
        /**
         * Defines a function used to convert animation targets from loaded scene to current scene (default: search node by name)
         */
        public targetConverter?: Nullable<(target: any) => any>,
        /**
         * Defines the extension to use to load the scene (if not defined, ".babylon" will be used)
         */
        public extension?: string
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        const startingIndexForNewAnimatables = scene.animatables.length;
        const startingIndexForNewAnimationGroups = scene.animationGroups.length;
        this.loadedAnimatables = [];
        this.loadedAnimationGroups = [];
        SceneLoader.ImportAnimations(
            this.rootUrl,
            this.filename,
            scene,
            false,
            SceneLoaderAnimationGroupLoadingMode.NoSync,
            this.targetConverter,
            () => {
                this.loadedAnimatables = scene.animatables.slice(startingIndexForNewAnimatables);
                this.loadedAnimationGroups = scene.animationGroups.slice(startingIndexForNewAnimationGroups);

                onSuccess();
            },
            null,
            (scene, message, exception) => {
                onError(message, exception);
            },
            this.extension
        );
    }
}

/**
 * Define a task used by AssetsManager to load text content
 */
export class TextFileAssetTask extends AbstractAssetTask {
    /**
     * Gets the loaded text string
     */
    public text: string;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: TextFileAssetTask) => void;

    /**
     * Callback called when the task is successful
     */
    public override onError: (task: TextFileAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new TextFileAssetTask object
     * @param name defines the name of the task
     * @param url defines the location of the file to load
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the location of the file to load
         */
        public url: string
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        scene._loadFile(
            this.url,
            (data) => {
                this.text = data as string;
                onSuccess();
            },
            undefined,
            false,
            false,
            (request, exception) => {
                if (request) {
                    onError(request.status + " " + request.statusText, exception);
                }
            }
        );
    }
}

/**
 * Define a task used by AssetsManager to load binary data
 */
export class BinaryFileAssetTask extends AbstractAssetTask {
    /**
     * Gets the loaded data (as an array buffer)
     */
    public data: ArrayBuffer;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: BinaryFileAssetTask) => void;
    /**
     * Callback called when the task is successful
     */
    public override onError: (task: BinaryFileAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new BinaryFileAssetTask object
     * @param name defines the name of the new task
     * @param url defines the location of the file to load
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the location of the file to load
         */
        public url: string
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        scene._loadFile(
            this.url,
            (data) => {
                this.data = data as ArrayBuffer;
                onSuccess();
            },
            undefined,
            true,
            true,
            (request, exception) => {
                if (request) {
                    onError(request.status + " " + request.statusText, exception);
                }
            }
        );
    }
}

/**
 * Define a task used by AssetsManager to load images
 */
export class ImageAssetTask extends AbstractAssetTask {
    /**
     * Gets the loaded images
     */
    public image: HTMLImageElement;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: ImageAssetTask) => void;
    /**
     * Callback called when the task is successful
     */
    public override onError: (task: ImageAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new ImageAssetTask
     * @param name defines the name of the task
     * @param url defines the location of the image to load
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the location of the image to load
         */
        public url: string
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        const img = new Image();

        Tools.SetCorsBehavior(this.url, img);

        img.onload = () => {
            this.image = img;
            onSuccess();
        };

        img.onerror = (err: string | Event): any => {
            onError("Error loading image", err);
        };

        img.src = this.url;
    }
}

/**
 * Defines the interface used by texture loading tasks
 */
export interface ITextureAssetTask<Tex extends BaseTexture> {
    /**
     * Gets the loaded texture
     */
    texture: Tex;
}

/**
 * Define a task used by AssetsManager to load 2D textures
 */
export class TextureAssetTask extends AbstractAssetTask implements ITextureAssetTask<Texture> {
    /**
     * Gets the loaded texture
     */
    public texture: Texture;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: TextureAssetTask) => void;
    /**
     * Callback called when the task is successful
     */
    public override onError: (task: TextureAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new TextureAssetTask object
     * @param name defines the name of the task
     * @param url defines the location of the file to load
     * @param noMipmap defines if mipmap should not be generated (default is false)
     * @param invertY defines if texture must be inverted on Y axis (default is true)
     * @param samplingMode defines the sampling mode to use (default is Texture.TRILINEAR_SAMPLINGMODE)
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the location of the file to load
         */
        public url: string,
        /**
         * Defines if mipmap should not be generated (default is false)
         */
        public noMipmap?: boolean,
        /**
         * [true] Defines if texture must be inverted on Y axis (default is true)
         */
        public invertY: boolean = true,
        /**
         * [3] Defines the sampling mode to use (default is Texture.TRILINEAR_SAMPLINGMODE)
         */
        public samplingMode: number = Texture.TRILINEAR_SAMPLINGMODE
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        const onload = () => {
            onSuccess();
        };

        const onerror = (message?: string, exception?: any) => {
            onError(message, exception);
        };

        this.texture = new Texture(this.url, scene, this.noMipmap, this.invertY, this.samplingMode, onload, onerror);
    }
}

/**
 * Define a task used by AssetsManager to load cube textures
 */
export class CubeTextureAssetTask extends AbstractAssetTask implements ITextureAssetTask<CubeTexture> {
    /**
     * Gets the loaded texture
     */
    public texture: CubeTexture;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: CubeTextureAssetTask) => void;
    /**
     * Callback called when the task is successful
     */
    public override onError: (task: CubeTextureAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new CubeTextureAssetTask
     * @param name defines the name of the task
     * @param url defines the location of the files to load (You have to specify the folder where the files are + filename with no extension)
     * @param extensions defines the extensions to use to load files (["_px", "_py", "_pz", "_nx", "_ny", "_nz"] by default)
     * @param noMipmap defines if mipmaps should not be generated (default is false)
     * @param files defines the explicit list of files (undefined by default)
     * @param prefiltered
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the location of the files to load (You have to specify the folder where the files are + filename with no extension)
         */
        public url: string,
        /**
         * Defines the extensions to use to load files (["_px", "_py", "_pz", "_nx", "_ny", "_nz"] by default)
         */
        public extensions?: string[],
        /**
         * Defines if mipmaps should not be generated (default is false)
         */
        public noMipmap?: boolean,
        /**
         * Defines the explicit list of files (undefined by default)
         */
        public files?: string[],
        /**
         * Defines the prefiltered texture option (default is false)
         */
        public prefiltered?: boolean
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        const onload = () => {
            onSuccess();
        };

        const onerror = (message?: string, exception?: any) => {
            onError(message, exception);
        };

        this.texture = new CubeTexture(this.url, scene, this.extensions, this.noMipmap, this.files, onload, onerror, undefined, this.prefiltered);
    }
}

/**
 * Define a task used by AssetsManager to load HDR cube textures
 */
export class HDRCubeTextureAssetTask extends AbstractAssetTask implements ITextureAssetTask<HDRCubeTexture> {
    /**
     * Gets the loaded texture
     */
    public texture: HDRCubeTexture;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: HDRCubeTextureAssetTask) => void;
    /**
     * Callback called when the task is successful
     */
    public override onError: (task: HDRCubeTextureAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new HDRCubeTextureAssetTask object
     * @param name defines the name of the task
     * @param url defines the location of the file to load
     * @param size defines the desired size (the more it increases the longer the generation will be) If the size is omitted this implies you are using a preprocessed cubemap.
     * @param noMipmap defines if mipmaps should not be generated (default is false)
     * @param generateHarmonics specifies whether you want to extract the polynomial harmonics during the generation process (default is true)
     * @param gammaSpace specifies if the texture will be use in gamma or linear space (the PBR material requires those texture in linear space, but the standard material would require them in Gamma space) (default is false)
     * @param reserved Internal use only
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the location of the file to load
         */
        public url: string,
        /**
         * Defines the desired size (the more it increases the longer the generation will be)
         */
        public size: number,
        /**
         * [false] Defines if mipmaps should not be generated (default is false)
         */
        public noMipmap = false,
        /**
         * [true] Specifies whether you want to extract the polynomial harmonics during the generation process (default is true)
         */
        public generateHarmonics = true,
        /**
         * [false] Specifies if the texture will be use in gamma or linear space (the PBR material requires those texture in linear space, but the standard material would require them in Gamma space) (default is false)
         */
        public gammaSpace = false,
        /**
         * [false] Internal Use Only
         */
        public reserved = false
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        const onload = () => {
            onSuccess();
        };

        const onerror = (message?: string, exception?: any) => {
            onError(message, exception);
        };

        this.texture = new HDRCubeTexture(this.url, scene, this.size, this.noMipmap, this.generateHarmonics, this.gammaSpace, this.reserved, onload, onerror);
    }
}

/**
 * Define a task used by AssetsManager to load Equirectangular cube textures
 */
export class EquiRectangularCubeTextureAssetTask extends AbstractAssetTask implements ITextureAssetTask<EquiRectangularCubeTexture> {
    /**
     * Gets the loaded texture
     */
    public texture: EquiRectangularCubeTexture;

    /**
     * Callback called when the task is successful
     */
    public override onSuccess: (task: EquiRectangularCubeTextureAssetTask) => void;
    /**
     * Callback called when the task is successful
     */
    public override onError: (task: EquiRectangularCubeTextureAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new EquiRectangularCubeTextureAssetTask object
     * @param name defines the name of the task
     * @param url defines the location of the file to load
     * @param size defines the desired size (the more it increases the longer the generation will be)
     * If the size is omitted this implies you are using a preprocessed cubemap.
     * @param noMipmap defines if mipmaps should not be generated (default is false)
     * @param gammaSpace specifies if the texture will be used in gamma or linear space
     * (the PBR material requires those texture in linear space, but the standard material would require them in Gamma space)
     * (default is true)
     */
    constructor(
        /**
         * Defines the name of the task
         */
        public override name: string,
        /**
         * Defines the location of the file to load
         */
        public url: string,
        /**
         * Defines the desired size (the more it increases the longer the generation will be)
         */
        public size: number,
        /**
         * [false] Defines if mipmaps should not be generated (default is false)
         */
        public noMipmap: boolean = false,
        /**
         * [true] Specifies if the texture will be use in gamma or linear space (the PBR material requires those texture in linear space,
         * but the standard material would require them in Gamma space) (default is true)
         */
        public gammaSpace: boolean = true
    ) {
        super(name);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public override runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void): void {
        const onload = () => {
            onSuccess();
        };

        const onerror = (message?: string, exception?: any) => {
            onError(message, exception);
        };

        this.texture = new EquiRectangularCubeTexture(this.url, scene, this.size, this.noMipmap, this.gammaSpace, onload, onerror);
    }
}

/**
 * This class can be used to easily import assets into a scene
 * @see https://doc.babylonjs.com/features/featuresDeepDive/importers/assetManager
 */
export class AssetsManager {
    private _scene: Scene;
    private _isLoading = false;

    protected _tasks = new Array<AbstractAssetTask>();
    protected _waitingTasksCount = 0;
    protected _totalTasksCount = 0;

    /**
     * Callback called when all tasks are processed
     */
    public onFinish: (tasks: AbstractAssetTask[]) => void;

    /**
     * Callback called when a task is successful
     */
    public onTaskSuccess: (task: AbstractAssetTask) => void;

    /**
     * Callback called when a task had an error
     */
    public onTaskError: (task: AbstractAssetTask) => void;

    /**
     * Callback called when a task is done (whatever the result is)
     */
    public onProgress: (remainingCount: number, totalCount: number, task: AbstractAssetTask) => void;

    /**
     * Observable called when all tasks are processed
     */
    public onTaskSuccessObservable = new Observable<AbstractAssetTask>();

    /**
     * Observable called when a task had an error
     */
    public onTaskErrorObservable = new Observable<AbstractAssetTask>();

    /**
     * Observable called when all tasks were executed
     */
    public onTasksDoneObservable = new Observable<AbstractAssetTask[]>();

    /**
     * Observable called when a task is done (whatever the result is)
     */
    public onProgressObservable = new Observable<IAssetsProgressEvent>();

    /**
     * Gets or sets a boolean defining if the AssetsManager should use the default loading screen
     * @see https://doc.babylonjs.com/features/featuresDeepDive/scene/customLoadingScreen
     */
    public useDefaultLoadingScreen = true;

    /**
     * Gets or sets a boolean defining if the AssetsManager should automatically hide the loading screen
     * when all assets have been downloaded.
     * If set to false, you need to manually call in hideLoadingUI() once your scene is ready.
     */
    public autoHideLoadingUI = true;

    /**
     * Creates a new AssetsManager
     * @param scene defines the scene to work on
     */
    constructor(scene?: Scene) {
        this._scene = scene || <Scene>EngineStore.LastCreatedScene;
    }

    /**
     * Add a ContainerAssetTask to the list of active tasks
     * @param taskName defines the name of the new task
     * @param meshesNames defines the name of meshes to load
     * @param rootUrl defines the root url to use to locate files
     * @param sceneFilename defines the filename of the scene file or the File itself
     * @param extension defines the extension to use to load the file
     * @returns a new ContainerAssetTask object
     */
    public addContainerTask(taskName: string, meshesNames: any, rootUrl: string, sceneFilename: string | File, extension?: string): ContainerAssetTask {
        const task = new ContainerAssetTask(taskName, meshesNames, rootUrl, sceneFilename, extension);
        this._tasks.push(task);

        return task;
    }

    /**
     * Add a MeshAssetTask to the list of active tasks
     * @param taskName defines the name of the new task
     * @param meshesNames defines the name of meshes to load
     * @param rootUrl defines the root url to use to locate files
     * @param sceneFilename defines the filename of the scene file or the File itself
     * @param extension defines the extension to use to load the file
     * @returns a new MeshAssetTask object
     */
    public addMeshTask(taskName: string, meshesNames: any, rootUrl: string, sceneFilename: string | File, extension?: string): MeshAssetTask {
        const task = new MeshAssetTask(taskName, meshesNames, rootUrl, sceneFilename, extension);
        this._tasks.push(task);

        return task;
    }

    /**
     * Add a TextFileAssetTask to the list of active tasks
     * @param taskName defines the name of the new task
     * @param url defines the url of the file to load
     * @returns a new TextFileAssetTask object
     */
    public addTextFileTask(taskName: string, url: string): TextFileAssetTask {
        const task = new TextFileAssetTask(taskName, url);
        this._tasks.push(task);

        return task;
    }

    /**
     * Add a BinaryFileAssetTask to the list of active tasks
     * @param taskName defines the name of the new task
     * @param url defines the url of the file to load
     * @returns a new BinaryFileAssetTask object
     */
    public addBinaryFileTask(taskName: string, url: string): BinaryFileAssetTask {
        const task = new BinaryFileAssetTask(taskName, url);
        this._tasks.push(task);

        return task;
    }

    /**
     * Add a ImageAssetTask to the list of active tasks
     * @param taskName defines the name of the new task
     * @param url defines the url of the file to load
     * @returns a new ImageAssetTask object
     */
    public addImageTask(taskName: string, url: string): ImageAssetTask {
        const task = new ImageAssetTask(taskName, url);
        this._tasks.push(task);

        return task;
    }

    /**
     * Add a TextureAssetTask to the list of active tasks
     * @param taskName defines the name of the new task
     * @param url defines the url of the file to load
     * @param noMipmap defines if the texture must not receive mipmaps (false by default)
     * @param invertY defines if you want to invert Y axis of the loaded texture (true by default)
     * @param samplingMode defines the sampling mode to use (Texture.TRILINEAR_SAMPLINGMODE by default)
     * @returns a new TextureAssetTask object
     */
    public addTextureTask(taskName: string, url: string, noMipmap?: boolean, invertY?: boolean, samplingMode: number = Texture.TRILINEAR_SAMPLINGMODE): TextureAssetTask {
        const task = new TextureAssetTask(taskName, url, noMipmap, invertY, samplingMode);
        this._tasks.push(task);

        return task;
    }

    /**
     * Add a CubeTextureAssetTask to the list of active tasks
     * @param taskName defines the name of the new task
     * @param url defines the url of the file to load
     * @param extensions defines the extension to use to load the cube map (can be null)
     * @param noMipmap defines if the texture must not receive mipmaps (false by default)
     * @param files defines the list of files to load (can be null)
     * @param prefiltered defines the prefiltered texture option (default is false)
     * @returns a new CubeTextureAssetTask object
     */
    public addCubeTextureTask(taskName: string, url: string, extensions?: string[], noMipmap?: boolean, files?: string[], prefiltered?: boolean): CubeTextureAssetTask {
        const task = new CubeTextureAssetTask(taskName, url, extensions, noMipmap, files, prefiltered);
        this._tasks.push(task);

        return task;
    }

    /**
     *
     * Add a HDRCubeTextureAssetTask to the list of active tasks
     * @param taskName defines the name of the new task
     * @param url defines the url of the file to load
     * @param size defines the size you want for the cubemap (can be null)
     * @param noMipmap defines if the texture must not receive mipmaps (false by default)
     * @param generateHarmonics defines if you want to automatically generate (true by default)
     * @param gammaSpace specifies if the texture will be use in gamma or linear space (the PBR material requires those texture in linear space, but the standard material would require them in Gamma space) (default is false)
     * @param reserved Internal use only
     * @returns a new HDRCubeTextureAssetTask object
     */
    public addHDRCubeTextureTask(
        taskName: string,
        url: string,
        size: number,
        noMipmap = false,
        generateHarmonics = true,
        gammaSpace = false,
        reserved = false
    ): HDRCubeTextureAssetTask {
        const task = new HDRCubeTextureAssetTask(taskName, url, size, noMipmap, generateHarmonics, gammaSpace, reserved);
        this._tasks.push(task);

        return task;
    }

    /**
     *
     * Add a EquiRectangularCubeTextureAssetTask to the list of active tasks
     * @param taskName defines the name of the new task
     * @param url defines the url of the file to load
     * @param size defines the size you want for the cubemap (can be null)
     * @param noMipmap defines if the texture must not receive mipmaps (false by default)
     * @param gammaSpace Specifies if the texture will be used in gamma or linear space
     * (the PBR material requires those textures in linear space, but the standard material would require them in Gamma space)
     * @returns a new EquiRectangularCubeTextureAssetTask object
     */
    public addEquiRectangularCubeTextureAssetTask(taskName: string, url: string, size: number, noMipmap = false, gammaSpace = true): EquiRectangularCubeTextureAssetTask {
        const task = new EquiRectangularCubeTextureAssetTask(taskName, url, size, noMipmap, gammaSpace);
        this._tasks.push(task);

        return task;
    }

    /**
     * Remove a task from the assets manager.
     * @param task the task to remove
     */
    public removeTask(task: AbstractAssetTask) {
        const index = this._tasks.indexOf(task);

        if (index > -1) {
            this._tasks.splice(index, 1);
        }
    }

    private _decreaseWaitingTasksCount(task: AbstractAssetTask): void {
        this._waitingTasksCount--;

        try {
            if (this.onProgress) {
                this.onProgress(this._waitingTasksCount, this._totalTasksCount, task);
            }

            this.onProgressObservable.notifyObservers(new AssetsProgressEvent(this._waitingTasksCount, this._totalTasksCount, task));
        } catch (e) {
            Logger.Error("Error running progress callbacks.");
            Logger.Log(e);
        }

        if (this._waitingTasksCount === 0) {
            try {
                const currentTasks = this._tasks.slice();

                if (this.onFinish) {
                    // Calling onFinish with immutable array of tasks
                    this.onFinish(currentTasks);
                }

                // Let's remove successful tasks
                for (const task of currentTasks) {
                    if (task.taskState === AssetTaskState.DONE) {
                        const index = this._tasks.indexOf(task);

                        if (index > -1) {
                            this._tasks.splice(index, 1);
                        }
                    }
                }

                this.onTasksDoneObservable.notifyObservers(this._tasks);
            } catch (e) {
                Logger.Error("Error running tasks-done callbacks.");
                Logger.Log(e);
            }
            this._isLoading = false;
            if (this.autoHideLoadingUI) {
                this._scene.getEngine().hideLoadingUI();
            }
        }
    }

    private _runTask(task: AbstractAssetTask): void {
        const done = () => {
            try {
                if (this.onTaskSuccess) {
                    this.onTaskSuccess(task);
                }
                this.onTaskSuccessObservable.notifyObservers(task);
                this._decreaseWaitingTasksCount(task);
            } catch (e) {
                error("Error executing task success callbacks", e);
            }
        };

        const error = (message?: string, exception?: any) => {
            task._setErrorObject(message, exception);

            if (this.onTaskError) {
                this.onTaskError(task);
            } else if (!task.onError) {
                Logger.Error(this._formatTaskErrorMessage(task));
            }
            this.onTaskErrorObservable.notifyObservers(task);
            this._decreaseWaitingTasksCount(task);
        };

        task.run(this._scene, done, error);
    }

    private _formatTaskErrorMessage(task: AbstractAssetTask) {
        let errorMessage = "Unable to complete task " + task.name;

        if (task.errorObject.message) {
            errorMessage += `: ${task.errorObject.message}`;
        }
        if (task.errorObject.exception) {
            errorMessage += `: ${task.errorObject.exception}`;
        }

        return errorMessage;
    }

    /**
     * Reset the AssetsManager and remove all tasks
     * @returns the current instance of the AssetsManager
     */
    public reset(): AssetsManager {
        this._isLoading = false;
        this._tasks = new Array<AbstractAssetTask>();
        return this;
    }

    /**
     * Start the loading process
     * @returns the current instance of the AssetsManager
     */
    public load(): AssetsManager {
        if (this._isLoading) {
            return this;
        }
        this._isLoading = true;
        this._waitingTasksCount = this._tasks.length;
        this._totalTasksCount = this._tasks.length;

        if (this._waitingTasksCount === 0) {
            this._isLoading = false;
            if (this.onFinish) {
                this.onFinish(this._tasks);
            }
            this.onTasksDoneObservable.notifyObservers(this._tasks);
            return this;
        }

        if (this.useDefaultLoadingScreen) {
            this._scene.getEngine().displayLoadingUI();
        }

        for (let index = 0; index < this._tasks.length; index++) {
            const task = this._tasks[index];
            if (task.taskState === AssetTaskState.INIT) {
                this._runTask(task);
            }
        }

        return this;
    }

    /**
     * Start the loading process as an async operation
     * @returns a promise returning the list of failed tasks
     */
    public async loadAsync(): Promise<void> {
        return await new Promise((resolve, reject) => {
            if (this._isLoading) {
                resolve();
                return;
            }
            this.onTasksDoneObservable.addOnce((remainingTasks) => {
                if (remainingTasks && remainingTasks.length) {
                    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                    reject(remainingTasks);
                } else {
                    resolve();
                }
            });

            this.load();
        });
    }
}
