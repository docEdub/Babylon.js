import type { Nullable } from "../types";
import { Observable } from "../Misc/observable";
import type { IReadonlyObservable } from "../Misc/observable";
import { Scene } from "../scene";
import type { Sprite } from "./sprite";
import type { ISpriteManager } from "./spriteManager";
import { CreatePickingRayInCameraSpace, CreatePickingRayInCameraSpaceToRef, Ray } from "../Culling/ray.core";
import type { Camera } from "../Cameras/camera";
import { PickingInfo } from "../Collisions/pickingInfo";
import type { ISceneComponent } from "../sceneComponent";
import { SceneComponentConstants } from "../sceneComponent";
import { ActionEvent } from "../Actions/actionEvent";
import { Constants } from "../Engines/constants";
import type { IPointerEvent } from "../Events/deviceInputEvents";

declare module "../scene" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface Scene {
        /** @internal */
        _pointerOverSprite: Nullable<Sprite>;

        /** @internal */
        _pickedDownSprite: Nullable<Sprite>;

        /** @internal */
        _tempSpritePickingRay: Nullable<Ray>;

        /**
         * All of the sprite managers added to this scene
         * @see https://doc.babylonjs.com/features/featuresDeepDive/sprites
         */
        spriteManagers?: Array<ISpriteManager>;

        /**
         * An event triggered when a sprite manager is added to the scene
         */
        readonly onNewSpriteManagerAddedObservable: IReadonlyObservable<ISpriteManager>;

        /**
         * An event triggered when a sprite manager is removed from the scene
         */
        readonly onSpriteManagerRemovedObservable: IReadonlyObservable<ISpriteManager>;

        /**
         * An event triggered when sprites rendering is about to start
         * Note: This event can be trigger more than once per frame (because sprites can be rendered by render target textures as well)
         */
        onBeforeSpritesRenderingObservable: Observable<Scene>;

        /**
         * An event triggered when sprites rendering is done
         * Note: This event can be trigger more than once per frame (because sprites can be rendered by render target textures as well)
         */
        onAfterSpritesRenderingObservable: Observable<Scene>;

        /** @internal */
        _internalPickSprites(ray: Ray, predicate?: (sprite: Sprite) => boolean, fastCheck?: boolean, camera?: Camera): Nullable<PickingInfo>;

        /** Launch a ray to try to pick a sprite in the scene
         * @param x position on screen
         * @param y position on screen
         * @param predicate Predicate function used to determine eligible sprites. Can be set to null. In this case, a sprite must have isPickable set to true
         * @param fastCheck defines if the first intersection will be used (and not the closest)
         * @param camera camera to use for computing the picking ray. Can be set to null. In this case, the scene.activeCamera will be used
         * @returns a PickingInfo
         */
        pickSprite(x: number, y: number, predicate?: (sprite: Sprite) => boolean, fastCheck?: boolean, camera?: Camera): Nullable<PickingInfo>;

        /** Use the given ray to pick a sprite in the scene
         * @param ray The ray (in world space) to use to pick meshes
         * @param predicate Predicate function used to determine eligible sprites. Can be set to null. In this case, a sprite must have isPickable set to true
         * @param fastCheck defines if the first intersection will be used (and not the closest)
         * @param camera camera to use. Can be set to null. In this case, the scene.activeCamera will be used
         * @returns a PickingInfo
         */
        pickSpriteWithRay(ray: Ray, predicate?: (sprite: Sprite) => boolean, fastCheck?: boolean, camera?: Camera): Nullable<PickingInfo>;

        /** @internal */
        _internalMultiPickSprites(ray: Ray, predicate?: (sprite: Sprite) => boolean, camera?: Camera): Nullable<PickingInfo[]>;

        /** Launch a ray to try to pick sprites in the scene
         * @param x position on screen
         * @param y position on screen
         * @param predicate Predicate function used to determine eligible sprites. Can be set to null. In this case, a sprite must have isPickable set to true
         * @param camera camera to use for computing the picking ray. Can be set to null. In this case, the scene.activeCamera will be used
         * @returns a PickingInfo array
         */
        multiPickSprite(x: number, y: number, predicate?: (sprite: Sprite) => boolean, camera?: Camera): Nullable<PickingInfo[]>;

        /** Use the given ray to pick sprites in the scene
         * @param ray The ray (in world space) to use to pick meshes
         * @param predicate Predicate function used to determine eligible sprites. Can be set to null. In this case, a sprite must have isPickable set to true
         * @param camera camera to use. Can be set to null. In this case, the scene.activeCamera will be used
         * @returns a PickingInfo array
         */
        multiPickSpriteWithRay(ray: Ray, predicate?: (sprite: Sprite) => boolean, camera?: Camera): Nullable<PickingInfo[]>;

        /**
         * Force the sprite under the pointer
         * @param sprite defines the sprite to use
         */
        setPointerOverSprite(sprite: Nullable<Sprite>): void;

        /**
         * Gets the sprite under the pointer
         * @returns a Sprite or null if no sprite is under the pointer
         */
        getPointerOverSprite(): Nullable<Sprite>;
    }
}

/** @internal */
export type InternalSpriteAugmentedScene = Scene & {
    _onNewSpriteManagerAddedObservable?: Observable<ISpriteManager>;
    _onSpriteManagerRemovedObservable?: Observable<ISpriteManager>;
};

Object.defineProperty(Scene.prototype, "onNewSpriteManagerAddedObservable", {
    get: function (this: InternalSpriteAugmentedScene) {
        if (!this.isDisposed && !this._onNewSpriteManagerAddedObservable) {
            const onNewSpriteManagerAddedObservable = (this._onNewSpriteManagerAddedObservable = new Observable<ISpriteManager>());
            this.onDisposeObservable.addOnce(() => onNewSpriteManagerAddedObservable.clear());
        }
        return this._onNewSpriteManagerAddedObservable;
    },
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Scene.prototype, "onSpriteManagerRemovedObservable", {
    get: function (this: InternalSpriteAugmentedScene) {
        if (!this.isDisposed && !this._onSpriteManagerRemovedObservable) {
            const onSpriteManagerRemovedObservable = (this._onSpriteManagerRemovedObservable = new Observable<ISpriteManager>());
            this.onDisposeObservable.addOnce(() => onSpriteManagerRemovedObservable.clear());
        }
        return this._onSpriteManagerRemovedObservable;
    },
    enumerable: true,
    configurable: true,
});

Scene.prototype._internalPickSprites = function (ray: Ray, predicate?: (sprite: Sprite) => boolean, fastCheck?: boolean, camera?: Camera): Nullable<PickingInfo> {
    if (!PickingInfo) {
        return null;
    }

    let pickingInfo = null;

    if (!camera) {
        if (!this.activeCamera) {
            return null;
        }
        camera = this.activeCamera;
    }

    if (this.spriteManagers && this.spriteManagers.length > 0) {
        for (let spriteIndex = 0; spriteIndex < this.spriteManagers.length; spriteIndex++) {
            const spriteManager = this.spriteManagers[spriteIndex];

            if (!spriteManager.isPickable) {
                continue;
            }

            const result = spriteManager.intersects(ray, camera, predicate, fastCheck);
            if (!result || !result.hit) {
                continue;
            }

            if (!fastCheck && pickingInfo != null && result.distance >= pickingInfo.distance) {
                continue;
            }

            pickingInfo = result;

            if (fastCheck) {
                break;
            }
        }
    }

    return pickingInfo || new PickingInfo();
};

Scene.prototype._internalMultiPickSprites = function (ray: Ray, predicate?: (sprite: Sprite) => boolean, camera?: Camera): Nullable<PickingInfo[]> {
    if (!PickingInfo) {
        return null;
    }

    let pickingInfos: PickingInfo[] = [];

    if (!camera) {
        if (!this.activeCamera) {
            return null;
        }
        camera = this.activeCamera;
    }

    if (this.spriteManagers && this.spriteManagers.length > 0) {
        for (let spriteIndex = 0; spriteIndex < this.spriteManagers.length; spriteIndex++) {
            const spriteManager = this.spriteManagers[spriteIndex];

            if (!spriteManager.isPickable) {
                continue;
            }

            const results = spriteManager.multiIntersects(ray, camera, predicate);

            if (results !== null) {
                pickingInfos = pickingInfos.concat(results);
            }
        }
    }

    return pickingInfos;
};

Scene.prototype.pickSprite = function (x: number, y: number, predicate?: (sprite: Sprite) => boolean, fastCheck?: boolean, camera?: Camera): Nullable<PickingInfo> {
    if (!this._tempSpritePickingRay) {
        return null;
    }

    CreatePickingRayInCameraSpaceToRef(this, x, y, this._tempSpritePickingRay, camera);

    const result = this._internalPickSprites(this._tempSpritePickingRay, predicate, fastCheck, camera);
    if (result) {
        result.ray = CreatePickingRayInCameraSpace(this, x, y, camera);
    }

    return result;
};

Scene.prototype.pickSpriteWithRay = function (ray: Ray, predicate?: (sprite: Sprite) => boolean, fastCheck?: boolean, camera?: Camera): Nullable<PickingInfo> {
    if (!this._tempSpritePickingRay) {
        return null;
    }

    if (!camera) {
        if (!this.activeCamera) {
            return null;
        }
        camera = this.activeCamera;
    }

    Ray.TransformToRef(ray, camera.getViewMatrix(), this._tempSpritePickingRay);

    const result = this._internalPickSprites(this._tempSpritePickingRay, predicate, fastCheck, camera);
    if (result) {
        result.ray = ray;
    }

    return result;
};

Scene.prototype.multiPickSprite = function (x: number, y: number, predicate?: (sprite: Sprite) => boolean, camera?: Camera): Nullable<PickingInfo[]> {
    CreatePickingRayInCameraSpaceToRef(this, x, y, this._tempSpritePickingRay!, camera);

    return this._internalMultiPickSprites(this._tempSpritePickingRay!, predicate, camera);
};

Scene.prototype.multiPickSpriteWithRay = function (ray: Ray, predicate?: (sprite: Sprite) => boolean, camera?: Camera): Nullable<PickingInfo[]> {
    if (!this._tempSpritePickingRay) {
        return null;
    }

    if (!camera) {
        if (!this.activeCamera) {
            return null;
        }
        camera = this.activeCamera;
    }

    Ray.TransformToRef(ray, camera.getViewMatrix(), this._tempSpritePickingRay);

    return this._internalMultiPickSprites(this._tempSpritePickingRay, predicate, camera);
};

Scene.prototype.setPointerOverSprite = function (sprite: Nullable<Sprite>): void {
    if (this._pointerOverSprite === sprite) {
        return;
    }

    if (this._pointerOverSprite && this._pointerOverSprite.actionManager) {
        this._pointerOverSprite.actionManager.processTrigger(Constants.ACTION_OnPointerOutTrigger, ActionEvent.CreateNewFromSprite(this._pointerOverSprite, this));
    }

    this._pointerOverSprite = sprite;
    if (this._pointerOverSprite && this._pointerOverSprite.actionManager) {
        this._pointerOverSprite.actionManager.processTrigger(Constants.ACTION_OnPointerOverTrigger, ActionEvent.CreateNewFromSprite(this._pointerOverSprite, this));
    }
};

Scene.prototype.getPointerOverSprite = function (): Nullable<Sprite> {
    return this._pointerOverSprite;
};

/**
 * Defines the sprite scene component responsible to manage sprites
 * in a given scene.
 */
export class SpriteSceneComponent implements ISceneComponent {
    /**
     * The component name helpfull to identify the component in the list of scene components.
     */
    public readonly name = SceneComponentConstants.NAME_SPRITE;

    /**
     * The scene the component belongs to.
     */
    public scene: Scene;

    /** @internal */
    private _spritePredicate: (sprite: Sprite) => boolean;

    /**
     * Creates a new instance of the component for the given scene
     * @param scene Defines the scene to register the component in
     */
    constructor(scene: Scene) {
        this.scene = scene;
        this.scene.spriteManagers = [] as ISpriteManager[];
        // This ray is used to pick sprites in the scene
        this.scene._tempSpritePickingRay = Ray ? Ray.Zero() : null;
        this.scene.onBeforeSpritesRenderingObservable = new Observable<Scene>();
        this.scene.onAfterSpritesRenderingObservable = new Observable<Scene>();
        this._spritePredicate = (sprite: Sprite): boolean => {
            if (!sprite.actionManager) {
                return false;
            }
            return sprite.isPickable && sprite.actionManager.hasPointerTriggers;
        };
    }

    /**
     * Registers the component in a given scene
     */
    public register(): void {
        this.scene._pointerMoveStage.registerStep(SceneComponentConstants.STEP_POINTERMOVE_SPRITE, this, this._pointerMove);
        this.scene._pointerDownStage.registerStep(SceneComponentConstants.STEP_POINTERDOWN_SPRITE, this, this._pointerDown);
        this.scene._pointerUpStage.registerStep(SceneComponentConstants.STEP_POINTERUP_SPRITE, this, this._pointerUp);
    }

    /**
     * Rebuilds the elements related to this component in case of
     * context lost for instance.
     */
    public rebuild(): void {
        /** Nothing to do for sprites */
    }

    /**
     * Disposes the component and the associated resources.
     */
    public dispose(): void {
        this.scene.onBeforeSpritesRenderingObservable.clear();
        this.scene.onAfterSpritesRenderingObservable.clear();

        const spriteManagers = this.scene.spriteManagers;
        if (!spriteManagers) {
            return;
        }
        while (spriteManagers.length) {
            spriteManagers[0].dispose();
        }
    }

    private _pickSpriteButKeepRay(originalPointerInfo: Nullable<PickingInfo>, x: number, y: number, fastCheck?: boolean, camera?: Camera): Nullable<PickingInfo> {
        const result = this.scene.pickSprite(x, y, this._spritePredicate, fastCheck, camera);
        if (result) {
            result.ray = originalPointerInfo ? originalPointerInfo.ray : null;
        }
        return result;
    }

    private _pointerMove(
        unTranslatedPointerX: number,
        unTranslatedPointerY: number,
        pickResult: Nullable<PickingInfo>,
        isMeshPicked: boolean,
        element: Nullable<HTMLElement>
    ): Nullable<PickingInfo> {
        const scene = this.scene;
        if (isMeshPicked) {
            scene.setPointerOverSprite(null);
        } else {
            pickResult = this._pickSpriteButKeepRay(pickResult, unTranslatedPointerX, unTranslatedPointerY, false, scene.cameraToUseForPointers || undefined);

            if (pickResult && pickResult.hit && pickResult.pickedSprite) {
                scene.setPointerOverSprite(pickResult.pickedSprite);
                if (!scene.doNotHandleCursors && element) {
                    if (scene._pointerOverSprite && scene._pointerOverSprite.actionManager && scene._pointerOverSprite.actionManager.hoverCursor) {
                        element.style.cursor = scene._pointerOverSprite.actionManager.hoverCursor;
                    } else {
                        element.style.cursor = scene.hoverCursor;
                    }
                }
            } else {
                scene.setPointerOverSprite(null);
            }
        }

        return pickResult;
    }

    private _pointerDown(unTranslatedPointerX: number, unTranslatedPointerY: number, pickResult: Nullable<PickingInfo>, evt: IPointerEvent): Nullable<PickingInfo> {
        const scene = this.scene;
        scene._pickedDownSprite = null;
        if (scene.spriteManagers && scene.spriteManagers.length > 0) {
            pickResult = scene.pickSprite(unTranslatedPointerX, unTranslatedPointerY, this._spritePredicate, false, scene.cameraToUseForPointers || undefined);

            if (pickResult && pickResult.hit && pickResult.pickedSprite) {
                if (pickResult.pickedSprite.actionManager) {
                    scene._pickedDownSprite = pickResult.pickedSprite;
                    switch (evt.button) {
                        case 0:
                            pickResult.pickedSprite.actionManager.processTrigger(
                                Constants.ACTION_OnLeftPickTrigger,
                                ActionEvent.CreateNewFromSprite(pickResult.pickedSprite, scene, evt)
                            );
                            break;
                        case 1:
                            pickResult.pickedSprite.actionManager.processTrigger(
                                Constants.ACTION_OnCenterPickTrigger,
                                ActionEvent.CreateNewFromSprite(pickResult.pickedSprite, scene, evt)
                            );
                            break;
                        case 2:
                            pickResult.pickedSprite.actionManager.processTrigger(
                                Constants.ACTION_OnRightPickTrigger,
                                ActionEvent.CreateNewFromSprite(pickResult.pickedSprite, scene, evt)
                            );
                            break;
                    }
                    if (pickResult.pickedSprite.actionManager) {
                        pickResult.pickedSprite.actionManager.processTrigger(
                            Constants.ACTION_OnPickDownTrigger,
                            ActionEvent.CreateNewFromSprite(pickResult.pickedSprite, scene, evt)
                        );
                    }
                }
            }
        }

        return pickResult;
    }

    private _pointerUp(
        unTranslatedPointerX: number,
        unTranslatedPointerY: number,
        pickResult: Nullable<PickingInfo>,
        evt: IPointerEvent,
        doubleClick: boolean
    ): Nullable<PickingInfo> {
        const scene = this.scene;
        if (scene.spriteManagers && scene.spriteManagers.length > 0) {
            const spritePickResult = scene.pickSprite(unTranslatedPointerX, unTranslatedPointerY, this._spritePredicate, false, scene.cameraToUseForPointers || undefined);

            if (spritePickResult) {
                if (spritePickResult.hit && spritePickResult.pickedSprite) {
                    if (spritePickResult.pickedSprite.actionManager) {
                        spritePickResult.pickedSprite.actionManager.processTrigger(
                            Constants.ACTION_OnPickUpTrigger,
                            ActionEvent.CreateNewFromSprite(spritePickResult.pickedSprite, scene, evt)
                        );

                        if (spritePickResult.pickedSprite.actionManager) {
                            if (!this.scene._inputManager._isPointerSwiping()) {
                                spritePickResult.pickedSprite.actionManager.processTrigger(
                                    Constants.ACTION_OnPickTrigger,
                                    ActionEvent.CreateNewFromSprite(spritePickResult.pickedSprite, scene, evt)
                                );
                            }

                            if (doubleClick) {
                                spritePickResult.pickedSprite.actionManager.processTrigger(
                                    Constants.ACTION_OnDoublePickTrigger,
                                    ActionEvent.CreateNewFromSprite(spritePickResult.pickedSprite, scene, evt)
                                );
                            }
                        }
                    }
                }
                if (scene._pickedDownSprite && scene._pickedDownSprite.actionManager && scene._pickedDownSprite !== spritePickResult.pickedSprite) {
                    scene._pickedDownSprite.actionManager.processTrigger(Constants.ACTION_OnPickOutTrigger, ActionEvent.CreateNewFromSprite(scene._pickedDownSprite, scene, evt));
                }
            }
        }

        return pickResult;
    }
}
