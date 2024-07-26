/* eslint-disable */

import type { IBasicAudioBusBackend, IBasicAudioEngineBackend, IBasicAudioPositionerBackend, IBasicAudioSourceBackend, IBasicAudioVoiceBackend } from "./basicBackend";
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

abstract class AbstractWebAudioSubGraph {
    abstract firstNode: AudioNode;
    abstract lastNode: AudioNode;
}

export class AudioEffectChain extends AbstractWebAudioSubGraph {
    nodes: Array<AudioNode>;

    get firstNode(): AudioNode {
        return this.nodes[0];
    }

    get lastNode(): AudioNode {
        return this.nodes[this.nodes.length - 1];
    }
}

export class AudioPositioner extends AbstractWebAudioSubGraph implements IBasicAudioPositionerBackend {
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

    effectChain?: AudioEffectChain;
    positioner?: AudioPositioner;

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

abstract class AbstractWebAudioSource implements IBasicAudioSourceBackend {
    constructor(engine: AudioEngine, options?: any) {
        //
    }
}

export class SoundSource extends AbstractWebAudioSource {
    buffer: AudioBuffer;

    constructor(engine: AudioEngine, options?: any) {
        super(engine, options);
    }
}

export class SoundStreamSource extends AbstractWebAudioSource {
    audioElement: HTMLAudioElement;
}

abstract class AbstractWebAudioSound extends AbstractWebAudioGraphItem implements IBasicAudioVoiceBackend {
    abstract source: AbstractWebAudioSource;

    abstract start(): void;
    abstract stop(): void;
}

export class Sound extends AbstractWebAudioSound {
    node: AudioBufferSourceNode;
    source: SoundSource;

    start(): void {}
    stop(): void {}
}

export class SoundStream extends AbstractWebAudioSound {
    node: MediaElementAudioSourceNode;
    source: SoundStreamSource;

    start(): void {}
    stop(): void {}
}
