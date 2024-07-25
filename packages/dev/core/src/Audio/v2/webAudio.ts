/* eslint-disable */

import type {
    IAdvancedAudioBus,
    IAdvancedAudioEngine,
    IAdvancedAudioSource,
    IAdvancedAudioVoice,
    IAudioBus,
    IAudioEngine,
    IAudioPositioner,
    IAudioSource,
    IAudioVoice,
} from "./physical";
import { AbstractPhysicalAudioEngine, PhysicalAudioBus, PhysicalAudioSource, PhysicalAudioVoice } from "./physical";
import { Vector3 } from "../../Maths/math.vector";

/*
WebAudio backend.

The basic classes in this module will replace our legacy audio engine ...
    - AudioEngine
    - AudioBus
    - Sound
    - SoundStream

The advanced classes extend the core classes to implement the advanced audio engine's physical interfaces.

TODO: Split file into webAudioCore.ts and webAudio.ts?
*/

// TODO: Consider generics for the member types.
//  - Consider getting member type constructors programmatically similar to light.ts `GetConstructorFromName`.
export class WebAudioEngine implements IAudioEngine {
    audioContext: AudioContext;

    inputs = new Array<WebAudioBus>();

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
export class AdvancedWebAudioEngine extends WebAudioEngine implements IAdvancedAudioEngine {
    physicalEngine: AbstractPhysicalAudioEngine;
    startTime: number = 0;

    override inputs = new Array<AdvancedWebAudioBus>();

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

    createBus(options?: any): IAdvancedAudioBus {
        return new AdvancedWebAudioBus(this, options);
    }

    createSource(options?: any): IAdvancedAudioSource {
        return options?.stream ? new AdvancedWebAudioStreamSource(this, options) : new AdvancedWebAudioStaticSource(this, options);
    }

    createVoice(options?: any): IAdvancedAudioVoice {
        return options?.stream ? new AdvancedWebAudioStreamVoice(this, options) : new AdvancedWebAudioStaticVoice(this, options);
    }
}

export class WebAudioPhysicalEngine extends AbstractPhysicalAudioEngine {
    constructor(options?: any) {
        super(new AdvancedWebAudioEngine(options), options);

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
    engine: WebAudioEngine;
    abstract node: AudioNode;

    effectChain?: WebAudioEffectChain;
    positioner?: WebAudioPositioner;

    outputs = new Array<WebAudioBus>();

    get audioContext(): AudioContext {
        return this.engine.audioContext;
    }

    constructor(engine: WebAudioEngine, options?: any) {
        this.engine = engine;
    }
}

export class WebAudioBus extends AbstractWebAudioGraphItem implements IAudioBus {
    node: GainNode;

    inputs = new Array<AbstractWebAudioGraphItem>();

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);

        this.node = new GainNode(this.audioContext);
    }
}

class AdvancedWebAudioBus extends WebAudioBus implements IAdvancedAudioBus {
    override engine: AdvancedWebAudioEngine;
    physicalBus: PhysicalAudioBus;

    constructor(engine: AdvancedWebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalBus = new PhysicalAudioBus(this);
    }
}

abstract class AbstractWebAudioSource implements IAudioSource {
    constructor(engine: WebAudioEngine, options?: any) {
        //
    }
}

class WebAudioStaticSource extends AbstractWebAudioSource {
    buffer: AudioBuffer;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);
    }
}

class AdvancedWebAudioStaticSource extends WebAudioStaticSource implements IAdvancedAudioSource {
    engine: AdvancedWebAudioEngine;
    physicalSource: PhysicalAudioSource;

    constructor(engine: AdvancedWebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalSource = new PhysicalAudioSource(this, options);
    }
}

class WebAudioStreamSource extends AbstractWebAudioSource {
    audioElement: HTMLAudioElement;
}

class AdvancedWebAudioStreamSource extends WebAudioStreamSource implements IAdvancedAudioSource {
    engine: AdvancedWebAudioEngine;
    physicalSource: PhysicalAudioSource;

    constructor(engine: AdvancedWebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalSource = new PhysicalAudioSource(this, options);
    }
}

abstract class AbstractWebAudioSound extends AbstractWebAudioGraphItem implements IAudioVoice {
    abstract source: AbstractWebAudioSource;

    abstract start(): void;
    abstract stop(): void;
}

export class WebAudioSound extends AbstractWebAudioSound {
    node: AudioBufferSourceNode;
    source: WebAudioStaticSource;

    start(): void {}
    stop(): void {}
}

class AdvancedWebAudioStaticVoice extends WebAudioSound implements IAdvancedAudioVoice {
    override engine: AdvancedWebAudioEngine;
    override source: AdvancedWebAudioStaticSource;
    physicalVoice: PhysicalAudioVoice;

    constructor(engine: AdvancedWebAudioEngine, options?: any) {
        super(engine, options);
        this.engine = engine;
        this.physicalVoice = new PhysicalAudioVoice(this, options);
    }
}

export class WebAudioSoundStream extends AbstractWebAudioSound {
    node: MediaElementAudioSourceNode;
    source: WebAudioStreamSource;

    start(): void {}
    stop(): void {}
}

class AdvancedWebAudioStreamVoice extends WebAudioSoundStream implements IAdvancedAudioVoice {
    override engine: AdvancedWebAudioEngine;
    override source: AdvancedWebAudioStreamSource;
    physicalVoice: PhysicalAudioVoice;

    constructor(engine: AdvancedWebAudioEngine, options?: any) {
        super(engine, options);
        this.engine = engine;
        this.physicalVoice = new PhysicalAudioVoice(this, options);
    }
}
