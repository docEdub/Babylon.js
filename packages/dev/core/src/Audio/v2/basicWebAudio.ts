/* eslint-disable */

import {
    AbstractWebAudioSound,
    BasicWebAudioBus,
    BasicWebAudioEngine,
    BasicWebAudioStaticSource,
    BasicWebAudioStaticVoice,
    BasicWebAudioStreamSource,
    BasicWebAudioStreamVoice,
} from "./basicWebAudioBackend";
import { Nullable } from "../../types";

let currentEngine: Nullable<AudioEngine> = null;

function getCurrentEngine(): AudioEngine {
    return currentEngine ?? new AudioEngine();
}

let setCurrentEngine = (engine: AudioEngine) => {
    currentEngine = engine;
};

export class AudioEngine extends BasicWebAudioEngine {
    constructor(options?: any) {
        super(options);
        setCurrentEngine(this);
    }
}

export class AudioBus extends BasicWebAudioBus {
    name: string;

    constructor(name: string, options?: any, engine?: AudioEngine) {
        super(engine ?? getCurrentEngine(), options);
        this.name = name;
    }
}

export class SoundSource extends BasicWebAudioStaticSource {
    name: string;

    constructor(name: string, options?: any, engine?: AudioEngine) {
        super(engine ?? getCurrentEngine(), options);
        this.name = name;
    }
}

export class SoundStreamSource extends BasicWebAudioStreamSource {
    name: string;

    constructor(name: string, options?: any, engine?: AudioEngine) {
        super(engine ?? getCurrentEngine(), options);
        this.name = name;
    }
}

export class Sound {
    name: string;
    voice: AbstractWebAudioSound;

    constructor(name: string, options?: any, engine?: AudioEngine) {
        this.name = name;
        this.voice = options?.stream ? new BasicWebAudioStreamVoice(engine ?? getCurrentEngine(), options) : new BasicWebAudioStaticVoice(engine ?? getCurrentEngine(), options);
    }
}
