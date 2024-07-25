/* eslint-disable */

import type { IAudioBus, IAudioEngine, IAudioPositioner, IAudioSource, IAudioVoice, IBasicAudioBus, IBasicAudioEngine, IBasicAudioSource, IBasicAudioVoice } from "./physical";
import { AbstractPhysicalAudioEngine, PhysicalAudioBus, PhysicalAudioSource, PhysicalAudioVoice } from "./physical";
import { Vector3 } from "../../Maths/math.vector";

/*
WebAudio backend.

The basic classes in this module will replace our legacy audio engine ...
    - AudioEngine -> BasicWebAudioEngine
    - SoundTrack  -> BasicWebAudioBus
    - Sound       -> BasicWebAudioSound / BasicWebAudioSoundStream

The advanced classes extend the core classes to implement the advanced audio engine's physical interfaces.

TODO: Split file into webAudioCore.ts and webAudio.ts?
*/

// TODO: Consider generics for the member types.
//  - Consider getting member type constructors programmatically similar to light.ts `GetConstructorFromName`.
export class BasicWebAudioEngine implements IBasicAudioEngine {
    audioContext: AudioContext;

    inputs = new Array<BasicWebAudioBus>();

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
export class WebAudioEngine extends BasicWebAudioEngine implements IAudioEngine {
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

    createBus(options?: any): IAudioBus {
        return new WebAudioBus(this, options);
    }

    createSource(options?: any): IAudioSource {
        return options?.stream ? new WebAudioStreamSource(this, options) : new WebAudioStaticSource(this, options);
    }

    createVoice(options?: any): IAudioVoice {
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

class WebAudioPositioner extends AbstractWebAudioSubGraph implements IAudioPositioner {
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
    engine: BasicWebAudioEngine;
    abstract node: AudioNode;

    effectChain?: WebAudioEffectChain;
    positioner?: WebAudioPositioner;

    outputs = new Array<BasicWebAudioBus>();

    get audioContext(): AudioContext {
        return this.engine.audioContext;
    }

    constructor(engine: BasicWebAudioEngine, options?: any) {
        this.engine = engine;
    }
}

export class BasicWebAudioBus extends AbstractWebAudioGraphItem implements IBasicAudioBus {
    node: GainNode;

    inputs = new Array<AbstractWebAudioGraphItem>();

    constructor(engine: BasicWebAudioEngine, options?: any) {
        super(engine, options);

        this.node = new GainNode(this.audioContext);
    }
}

class WebAudioBus extends BasicWebAudioBus implements IAudioBus {
    override engine: WebAudioEngine;
    physicalBus: PhysicalAudioBus;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalBus = new PhysicalAudioBus(this);
    }
}

abstract class AbstractWebAudioSource implements IBasicAudioSource {
    constructor(engine: BasicWebAudioEngine, options?: any) {
        //
    }
}

class BasicWebAudioStaticSource extends AbstractWebAudioSource {
    buffer: AudioBuffer;

    constructor(engine: BasicWebAudioEngine, options?: any) {
        super(engine, options);
    }
}

class WebAudioStaticSource extends BasicWebAudioStaticSource implements IAudioSource {
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

class WebAudioStreamSource extends BasicWebAudioStreamSource implements IAudioSource {
    engine: WebAudioEngine;
    physicalSource: PhysicalAudioSource;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalSource = new PhysicalAudioSource(this, options);
    }
}

abstract class AbstractWebAudioSound extends AbstractWebAudioGraphItem implements IBasicAudioVoice {
    abstract source: AbstractWebAudioSource;

    abstract start(): void;
    abstract stop(): void;
}

export class BasicWebAudioSound extends AbstractWebAudioSound {
    node: AudioBufferSourceNode;
    source: BasicWebAudioStaticSource;

    start(): void {}
    stop(): void {}
}

class WebAudioStaticVoice extends BasicWebAudioSound implements IAudioVoice {
    override engine: WebAudioEngine;
    override source: WebAudioStaticSource;
    physicalVoice: PhysicalAudioVoice;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);
        this.engine = engine;
        this.physicalVoice = new PhysicalAudioVoice(this, options);
    }
}

export class BasicWebAudioSoundStream extends AbstractWebAudioSound {
    node: MediaElementAudioSourceNode;
    source: BasicWebAudioStreamSource;

    start(): void {}
    stop(): void {}
}

class WebAudioStreamVoice extends BasicWebAudioSoundStream implements IAudioVoice {
    override engine: WebAudioEngine;
    override source: WebAudioStreamSource;
    physicalVoice: PhysicalAudioVoice;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);
        this.engine = engine;
        this.physicalVoice = new PhysicalAudioVoice(this, options);
    }
}
