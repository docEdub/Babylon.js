import type { Nullable } from "core/types";
import { Vector3 } from "core/Maths/math.vector";
import type { TransformNode } from "core/Meshes/transformNode";
import { Sound } from "core/Audio/sound";
import { SoundTrack } from "core/Audio/soundTrack";

import type { IArrayItem, IScene, INode } from "../glTFLoaderInterfaces";
import type { IGLTFLoaderExtension } from "../glTFLoaderExtension";
import { GLTFLoader, ArrayItem } from "../glTFLoader";
import type { IKHRAudio_Audio, IKHRAudio_Emitter, IKHRAudio_EmittersReference, IKHRAudio_EmitterReference, IKHRAudio_Source } from "babylonjs-gltf2interface";
import { IKHRAudio_EmitterType } from "babylonjs-gltf2interface";

const NAME = "KHR_audio";

interface ILoaderClip extends IKHRAudio_Audio, IArrayItem {
    _objectURL?: Promise<string>;
}

interface ILoaderSource extends IKHRAudio_Source, IArrayItem {
    _babylonSound: Sound;
}

interface ILoaderEmitter extends IKHRAudio_Emitter, IArrayItem {
    _babylonData?: {
        loaded: Promise<any>;
    };
    _babylonSoundTrack: SoundTrack;
}

interface IKHRAudioEmitter {
    audio: ILoaderClip[];
    sources: ILoaderSource[];
    emitters: ILoaderEmitter[];
}

/**
 * [Specification](https://github.com/KhronosGroup/glTF/blob/5d3a2a35d139c72a7001aa4872041572b2e42fae/extensions/2.0/Khronos/KHR_audio/README.md)
 * !!! Experimental Extension Subject to Changes !!!
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class KHR_audio implements IGLTFLoaderExtension {
    /**
     * The name of this extension.
     */
    public readonly name = NAME;

    /**
     * Defines whether this extension is enabled.
     */
    public enabled: boolean;

    private _loader: GLTFLoader;
    private _clips: Array<ILoaderClip>;
    private _sources: Array<ILoaderSource>;
    private _emitters: Array<ILoaderEmitter>;

    /**
     * @internal
     */
    constructor(loader: GLTFLoader) {
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }

    /** @internal */
    public dispose() {
        (this._loader as any) = null;
        (this._clips as any) = null;
        (this._sources as any) = null;
        (this._emitters as any) = null;
    }

    /** @internal */
    public onLoading(): void {
        const extensions = this._loader.gltf.extensions;
        if (extensions && extensions[this.name]) {
            const extension = extensions[this.name] as IKHRAudioEmitter;

            this._clips = extension.audio;
            this._sources = extension.sources;
            this._emitters = extension.emitters;

            ArrayItem.Assign(this._clips);
            ArrayItem.Assign(this._emitters);
        }
    }

    /**
     * @internal
     */
    public loadSceneAsync(context: string, scene: IScene): Nullable<Promise<void>> {
        return GLTFLoader.LoadExtensionAsync<IKHRAudio_EmittersReference>(context, scene, this.name, (extensionContext, extension) => {
            const promises = new Array<Promise<any>>();

            promises.push(this._loader.loadSceneAsync(context, scene));

            for (const emitterIndex of extension.emitters) {
                const emitter = ArrayItem.Get(`${extensionContext}/emitters`, this._emitters, emitterIndex);
                if (emitter.type == IKHRAudio_EmitterType.positional || emitter.positional != undefined) {
                    throw new Error(`${extensionContext}: Positional properties are not allowed on emitters attached to a scene`);
                }

                promises.push(this._loadEmitterAsync(`${extensionContext}/emitters/${emitter.index}`, emitter, true));
            }

            return Promise.all(promises).then(() => {});
        });
    }

    /**
     * @internal
     */
    public loadNodeAsync(context: string, node: INode, assign: (babylonTransformNode: TransformNode) => void): Nullable<Promise<TransformNode>> {
        return GLTFLoader.LoadExtensionAsync<IKHRAudio_EmitterReference, TransformNode>(context, node, this.name, (extensionContext, extension) => {
            const promises = new Array<Promise<any>>();

            return this._loader
                .loadNodeAsync(extensionContext, node, (babylonMesh) => {
                    const emitter = ArrayItem.Get(`${extensionContext}/emitters`, this._emitters, extension.emitter);
                    promises.push(
                        this._loadEmitterAsync(`${extensionContext}/emitters/${emitter.index}`, emitter, false).then(() => {
                            for (const sound of emitter._babylonSoundTrack.soundCollection) {
                                sound.attachToMesh(babylonMesh);
                                if (emitter.type == IKHRAudio_EmitterType.positional && emitter.positional != undefined) {
                                    sound.spatialSound = true;
                                    sound.setLocalDirectionToMesh(Vector3.Forward());
                                    sound.setDirectionalCone(
                                        emitter.positional.coneInnerAngle != undefined ? emitter.positional.coneInnerAngle / 180 * Math.PI : 360,
                                        emitter.positional.coneOuterAngle != undefined ? emitter.positional.coneOuterAngle / 180 * Math.PI : 360,
                                        emitter.positional.coneOuterGain || 0
                                    );
                                    sound.refDistance = emitter.positional.refDistance || 1;
                                    sound.maxDistance = emitter.positional.maxDistance || 10000;
                                    sound.rolloffFactor = emitter.positional.rolloffFactor || 1;
                                    sound.distanceModel = emitter.positional.distanceModel || "inverse";
                                }
                            }
                        })
                    );

                    assign(babylonMesh);
                })
                .then((babylonMesh) => {
                    return Promise.all(promises).then(() => {
                        return babylonMesh;
                    });
                });
        });
    }

    private _loadClipAsync(context: string, clip: ILoaderClip): Promise<string> {
        if (clip._objectURL) {
            return clip._objectURL;
        }

        let promise: Promise<ArrayBufferView>;
        if (clip.uri) {
            promise = this._loader.loadUriAsync(context, clip, clip.uri);
        } else {
            const bufferView = ArrayItem.Get(`${context}/bufferView`, this._loader.gltf.bufferViews, clip.bufferView);
            promise = this._loader.loadBufferViewAsync(`/bufferViews/${bufferView.index}`, bufferView);
        }

        clip._objectURL = promise.then((data) => {
            return URL.createObjectURL(new Blob([data], { type: clip.mimeType }));
        });

        return clip._objectURL;
    }

    private _loadEmitterAsync(context: string, emitter: ILoaderEmitter, mainTrack: boolean): Promise<void> {
        emitter._babylonSoundTrack = emitter._babylonSoundTrack || new SoundTrack(this._loader.babylonScene, { mainTrack: mainTrack, volume: emitter.gain || 1 });
        if (!emitter._babylonData) {
            const clipPromises = new Array<Promise<any>>();
            const name = emitter.name || `emitter${emitter.index}`;

            emitter._babylonSoundTrack.soundCollection.length = emitter.sources.length;

            for (let i = 0; i < emitter.sources.length; i++) {
                const sourceContext = `/extensions/${this.name}/sources`;
                const source = ArrayItem.Get(sourceContext, this._sources, emitter.sources[i]);
                const clipContext = `/extensions/${this.name}/audio`;
                const clip = ArrayItem.Get(clipContext, this._clips, source.audio);
                clipPromises.push(
                    this._loadClipAsync(`${clipContext}/${source.audio}`, clip).then((objectURL: string) => {
                        const options = {
                            autoplay: source.autoPlay || false,
                            loop: source.loop || false,
                            volume: source.gain || 1
                        };
                        emitter._babylonSoundTrack.soundCollection[i] = new Sound(name, objectURL, this._loader.babylonScene, null, options);
                    })
                );
            }

            emitter._babylonData = {
                loaded: Promise.all(clipPromises),
            };
        }

        return emitter._babylonData.loaded;
    }
}

GLTFLoader.RegisterExtension(NAME, (loader) => new KHR_audio(loader));
