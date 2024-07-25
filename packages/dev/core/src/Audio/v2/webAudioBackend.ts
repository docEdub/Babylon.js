/* eslint-disable */

import type { IAudioBusBackend, IAudioEngineBackend, IAudioSourceBackend, IAudioVoiceBackend } from "./backend";
import type { IBasicAudioBusBackend, IBasicAudioEngineBackend, IBasicAudioPositionerBackend, IBasicAudioSourceBackend, IBasicAudioVoiceBackend } from "./basicBackend";
import { AbstractPhysicalAudioEngine, PhysicalAudioBus, PhysicalAudioSource, PhysicalAudioVoice } from "./physical";
import { Vector3 } from "../../Maths/math.vector";

/*
WebAudio backend.

The basic classes in this module will replace our legacy audio engine ...
    - AudioEngine -> AudioEngine
    - SoundTrack  -> AudioBus
    - Sound       -> Sound / SoundStream

The advanced classes extend the core classes to implement the advanced audio engine's physical interfaces.

TODO: Split file into webAudioCore.ts and webAudio.ts?
*/

export class AudioEngine implements IBasicAudioEngineBackend {
    audioContext: AudioContext;

    inputs = new Array<AudioBus>();

    get unlocked(): boolean {
        return this.audioContext.state !== "suspended";
    }

    constructor(options?: any) {
        this.audioContext = options?.audioContext ?? new AudioContext();

        // TODO: See WebXR button for an example of how to handle this in the UI.
        if (!this.unlocked) {
            if (options?.autoUnlock !== false) {
                const onWindowClick = () => {
                    this.unlock();
                    window.removeEventListener("click", onWindowClick);
                };
                window.addEventListener("click", onWindowClick);
            }

            // TODO: remove. not needed. was moved to advanced engine.
            // const onAudioContextStateChange = () => {
            //     if (this.unlocked) {
            //         this.audioContext.removeEventListener("statechange", onAudioContextStateChange);
            //     }
            // };
            // this.audioContext.addEventListener("statechange", onAudioContextStateChange);
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

// Advanced
export class WebAudioEngine extends AudioEngine implements IAudioEngineBackend {
    physicalEngine: AbstractPhysicalAudioEngine;
    startTime: number = 0;

    override inputs = new Array<WebAudioBus>();

    get currentTime(): number {
        return this.unlocked ? this.startTime + this.audioContext.currentTime : (performance.now() - this.startTime) / 1000;
    }

    constructor(options?: any) {
        super(options);

        if (!this.unlocked) {
            // Keep track of time while the audio context is locked so the engine still seems like it's running.
            this.startTime = performance.now();

            const onAudioContextStateChange = () => {
                if (this.unlocked) {
                    this.startTime = (performance.now() - this.startTime) / 1000;
                    this.audioContext.removeEventListener("statechange", onAudioContextStateChange);
                }
            };
            // TODO: Remove event listeners when disposed.
            this.audioContext.addEventListener("statechange", onAudioContextStateChange);
        }
    }

    createBus(options?: any): IAudioBusBackend {
        return new WebAudioBus(this, options);
    }

    createSource(options?: any): IAudioSourceBackend {
        return options?.stream ? new WebAudioStreamSource(this, options) : new WebAudioStaticSource(this, options);
    }

    createVoice(options?: any): IAudioVoiceBackend {
        return options?.stream ? new WebAudioStreamVoice(this, options) : new WebAudioStaticVoice(this, options);
    }
}

export class WebAudioPhysicalEngine extends AbstractPhysicalAudioEngine {
    constructor(options?: any) {
        super(new WebAudioEngine(options), options);

        this.backend.physicalEngine = this;
    }
}

abstract class AbstractWebAudioSubGraph {
    abstract firstNode: AudioNode;
    abstract lastNode: AudioNode;
}

class WebAudioEffectChain extends AbstractWebAudioSubGraph {
    nodes: Array<AudioNode>;

    get firstNode(): AudioNode {
        return this.nodes[0];
    }

    get lastNode(): AudioNode {
        return this.nodes[this.nodes.length - 1];
    }
}

class WebAudioPositioner extends AbstractWebAudioSubGraph implements IBasicAudioPositionerBackend {
    nodes: Array<AudioNode>;

    get firstNode(): AudioNode {
        return this.nodes[0]; // varies depending on settings
    }

    get lastNode(): AudioNode {
        return this.nodes[this.nodes.length - 1]; // varies depending on settings.
    }

    get position(): Vector3 {
        return new Vector3();
    }
    set position(position: Vector3) {}
}

abstract class AbstractWebAudioGraphItem {
    engine: AudioEngine;
    abstract node: AudioNode;

    effectChain?: WebAudioEffectChain;
    positioner?: WebAudioPositioner;

    outputs = new Array<AudioBus>();

    get audioContext(): AudioContext {
        return this.engine.audioContext;
    }

    constructor(engine: AudioEngine, options?: any) {
        this.engine = engine;
    }
}

export class AudioBus extends AbstractWebAudioGraphItem implements IBasicAudioBusBackend {
    node: GainNode;

    inputs = new Array<AbstractWebAudioGraphItem>();

    constructor(engine: AudioEngine, options?: any) {
        super(engine, options);

        this.node = new GainNode(this.audioContext);
    }
}

class WebAudioBus extends AudioBus implements IAudioBusBackend {
    override engine: WebAudioEngine;
    physicalBus: PhysicalAudioBus;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalBus = new PhysicalAudioBus(this);
    }
}

abstract class AbstractWebAudioSource implements IBasicAudioSourceBackend {
    constructor(engine: AudioEngine, options?: any) {
        //
    }
}

class BasicWebAudioStaticSource extends AbstractWebAudioSource {
    buffer: AudioBuffer;

    constructor(engine: AudioEngine, options?: any) {
        super(engine, options);
    }
}

class WebAudioStaticSource extends BasicWebAudioStaticSource implements IAudioSourceBackend {
    engine: WebAudioEngine;
    physicalSource: PhysicalAudioSource;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalSource = new PhysicalAudioSource(this, options);
    }
}

class BasicWebAudioStreamSource extends AbstractWebAudioSource {
    audioElement: HTMLAudioElement;
}

class WebAudioStreamSource extends BasicWebAudioStreamSource implements IAudioSourceBackend {
    engine: WebAudioEngine;
    physicalSource: PhysicalAudioSource;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalSource = new PhysicalAudioSource(this, options);
    }
}

abstract class AbstractWebAudioSound extends AbstractWebAudioGraphItem implements IBasicAudioVoiceBackend {
    abstract source: AbstractWebAudioSource;

    abstract start(): void;
    abstract stop(): void;
}

export class Sound extends AbstractWebAudioSound {
    node: AudioBufferSourceNode;
    source: BasicWebAudioStaticSource;

    start(): void {}
    stop(): void {}
}

class WebAudioStaticVoice extends Sound implements IAudioVoiceBackend {
    override engine: WebAudioEngine;
    override source: WebAudioStaticSource;
    physicalVoice: PhysicalAudioVoice;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);
        this.engine = engine;
        this.physicalVoice = new PhysicalAudioVoice(this, options);
    }
}

export class SoundStream extends AbstractWebAudioSound {
    node: MediaElementAudioSourceNode;
    source: BasicWebAudioStreamSource;

    start(): void {}
    stop(): void {}
}

class WebAudioStreamVoice extends SoundStream implements IAudioVoiceBackend {
    override engine: WebAudioEngine;
    override source: WebAudioStreamSource;
    physicalVoice: PhysicalAudioVoice;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);
        this.engine = engine;
        this.physicalVoice = new PhysicalAudioVoice(this, options);
    }
}
