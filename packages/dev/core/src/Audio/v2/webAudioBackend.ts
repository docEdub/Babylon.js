/* eslint-disable */

import type { IAudioBusBackend, IAudioEngineBackend, IAudioSourceBackend, IAudioVoiceBackend } from "./backend";
import { AudioBus, AudioEngine, Sound, SoundSource, SoundStream, SoundStreamSource } from "./basicWebAudioBackend";
import { AbstractPhysicalAudioEngine, PhysicalAudioBus, PhysicalAudioSource, PhysicalAudioVoice } from "./physical";

/*
WebAudio backend.

The basic classes in this module will replace our legacy audio engine ...
    - AudioEngine -> AudioEngine
    - SoundTrack  -> AudioBus
    - Sound       -> Sound / SoundStream

The advanced classes extend the core classes to implement the advanced audio engine's physical interfaces.

TODO: Split file into webAudioCore.ts and webAudio.ts?
*/

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

class WebAudioBus extends AudioBus implements IAudioBusBackend {
    override engine: WebAudioEngine;
    physicalBus: PhysicalAudioBus;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalBus = new PhysicalAudioBus(this);
    }
}

class WebAudioStaticSource extends SoundSource implements IAudioSourceBackend {
    engine: WebAudioEngine;
    physicalSource: PhysicalAudioSource;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalSource = new PhysicalAudioSource(this, options);
    }
}

class WebAudioStreamSource extends SoundStreamSource implements IAudioSourceBackend {
    engine: WebAudioEngine;
    physicalSource: PhysicalAudioSource;

    constructor(engine: WebAudioEngine, options?: any) {
        super(engine, options);

        this.engine = engine;
        this.physicalSource = new PhysicalAudioSource(this, options);
    }
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
