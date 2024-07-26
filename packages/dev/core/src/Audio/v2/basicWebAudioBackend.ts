/* eslint-disable */

import type { IBasicAudioBusBackend, IBasicAudioEngineBackend, IBasicAudioPositionerBackend, IBasicAudioSourceBackend, IBasicAudioVoiceBackend } from "./basicBackend";
import { IBasicCommonSoundOptions, IBasicSoundOptions, IBasicSoundStreamOptions } from "./basicOptions";
import { Vector3 } from "../../Maths/math.vector";
import { Nullable } from "core/types";

/*
WebAudio backend.

The basic classes in this module will replace our legacy audio engine ...
    - BasicWebAudioEngine -> BasicWebAudioEngine
    - SoundTrack  -> AudioBus
    - Sound       -> Sound / SoundStream

The advanced classes extend the core classes to implement the advanced audio engine's physical interfaces.

TODO: Split file into webAudioCore.ts and webAudio.ts?
*/

export class BasicWebAudioEngine implements IBasicAudioEngineBackend {
    audioContext: AudioContext;

    mainOutput: BasicWebAudioBus;

    get unlocked(): boolean {
        return this.audioContext.state !== "suspended";
    }

    constructor(options?: any) {
        this.audioContext = options?.audioContext ?? new AudioContext();
        this.mainOutput = new BasicWebAudioBus(options, this);

        // TODO: See WebXR button for an example of how to handle this in the UI.
        if (!this.unlocked) {
            if (options?.autoUnlock !== false) {
                const onWindowClick = () => {
                    this.unlock();
                    window.removeEventListener("click", onWindowClick);
                };
                window.addEventListener("click", onWindowClick);
            }
        }
    }

    /**
     * Sends an audio context unlock request.
     *
     * Called automatically on user interaction when the `autoUnlock` option is `true`.
     *
     * Note that the audio context cannot be locked again after it is unlocked, and it this function should not need to
     * be called again after the audio context is successfully unlocked. The audio context should stay unlocked for the
     * the audio context lifetime.
     */
    public unlock(): void {
        this.audioContext.resume();
    }
}

abstract class AbstractWebAudioSubGraph {
    abstract inputNode: Nullable<AudioNode>;
    abstract outputNode: Nullable<AudioNode>;
}

export class BasicWebAudioEffectChain extends AbstractWebAudioSubGraph {
    nodes: Array<AudioNode>;

    get inputNode(): Nullable<AudioNode> {
        return this.nodes[0];
    }

    get outputNode(): Nullable<AudioNode> {
        return this.nodes[this.nodes.length - 1];
    }
}

export class BasicWebAudioPositioner extends AbstractWebAudioSubGraph implements IBasicAudioPositionerBackend {
    nodes: Array<AudioNode>;

    get inputNode(): Nullable<AudioNode> {
        return this.nodes[0]; // varies depending on settings
    }

    get outputNode(): Nullable<AudioNode> {
        return this.nodes[this.nodes.length - 1]; // varies depending on settings.
    }

    get position(): Vector3 {
        return new Vector3();
    }
    set position(position: Vector3) {}
}

abstract class AbstractWebAudioGraphItem extends AbstractWebAudioSubGraph {
    engine: BasicWebAudioEngine;

    effectChain?: BasicWebAudioEffectChain;
    positioner?: BasicWebAudioPositioner;

    outputs = new Array<BasicWebAudioBus>();

    get audioContext(): AudioContext {
        return this.engine.audioContext;
    }

    constructor(engine: BasicWebAudioEngine, options?: any) {
        super();
        this.engine = engine;
    }
}

export class BasicWebAudioBus extends AbstractWebAudioGraphItem implements IBasicAudioBusBackend {
    _outputGainNode: GainNode;

    outputBus: Nullable<BasicWebAudioBus>;
    auxSendBusses: Nullable<Array<BasicWebAudioBus>>;
    inputBusses: Nullable<Array<BasicWebAudioBus>>;

    get inputNode(): Nullable<AudioNode> {
        return this._outputGainNode;
    }

    get outputNode(): Nullable<AudioNode> {
        return this._outputGainNode;
    }

    constructor(engine: BasicWebAudioEngine, options?: any) {
        super(engine, options);
        this._outputGainNode = new GainNode(this.audioContext);
    }
}

abstract class AbstractWebAudioSource implements IBasicAudioSourceBackend {
    constructor(engine: BasicWebAudioEngine, options?: any) {
        //
    }
}

export class BasicWebAudioStaticSource extends AbstractWebAudioSource {
    buffer: AudioBuffer;

    constructor(engine: BasicWebAudioEngine, options?: any) {
        super(engine, options);
    }
}

export class BasicWebAudioStreamSource extends AbstractWebAudioSource {
    audioElement: HTMLAudioElement;

    constructor(engine: BasicWebAudioEngine, options?: any) {
        super(engine, options);
    }
}

export abstract class AbstractWebAudioSound extends AbstractWebAudioGraphItem implements IBasicAudioVoiceBackend {
    abstract source: AbstractWebAudioSource;

    get inputNode(): Nullable<AudioNode> {
        return null;
    }

    constructor(engine: BasicWebAudioEngine, options?: IBasicCommonSoundOptions) {
        super(engine);
    }

    abstract start(): void;
    abstract stop(): void;
}

export class BasicWebAudioStaticVoice extends AbstractWebAudioSound {
    _sourceNode: AudioBufferSourceNode;
    _gainNode: GainNode;

    source: BasicWebAudioStaticSource;

    get outputNode(): Nullable<AudioNode> {
        return this._gainNode;
    }

    constructor(engine: BasicWebAudioEngine, options?: IBasicSoundOptions) {
        super(engine, options);

        this._sourceNode = new AudioBufferSourceNode(this.audioContext);
        this._gainNode = new GainNode(this.audioContext);

        this._sourceNode.connect(this._gainNode);
    }

    start(): void {}
    stop(): void {}
}

export class BasicWebAudioStreamVoice extends AbstractWebAudioSound {
    _sourceNode: MediaElementAudioSourceNode;
    _gainNode: GainNode;

    source: BasicWebAudioStreamSource;

    get outputNode(): Nullable<AudioNode> {
        return this._gainNode;
    }

    constructor(engine: BasicWebAudioEngine, options?: IBasicSoundStreamOptions) {
        super(engine, options);

        if (options?.source instanceof BasicWebAudioStreamSource) {
            this.source = options.source;
        } else {
            this.source = new BasicWebAudioStreamSource(engine, options);
        }

        this._gainNode = new GainNode(this.audioContext);

        this._sourceNode.connect(this._gainNode);
    }

    start(): void {}
    stop(): void {}
}
