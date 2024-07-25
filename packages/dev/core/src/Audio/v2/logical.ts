/* eslint-disable */

import { AudioVoiceState, VirtualAudioVoice } from "./common";
import { AbstractPhysicalAudioEngine, PhysicalAudioBus, PhysicalAudioSource } from "./physical";
import { WebAudioPhysicalEngine } from "./webAudio"; // TODO: Remove this. Doesn't belong here.
import { IDisposable } from "../../scene";
import { Nullable } from "../../types";

/*
Logical layer of the advanced audio engine. Communicates with the physical layer using virtual voices.

The logical layer wants to play all the virtual voices it's asked to play, but the physical layer limits the actual
number of voices that can be played at once. The logical layer sorts the virtual voices by importance, and the physical
layer mutes the least important virtual voices when there are too many of them trying to play.

See the `Engine.update` function.
*/

let currentEngine: Nullable<AudioEngine> = null;

function getCurrentEngine(): AudioEngine {
    return currentEngine ?? createDefaultEngine();
}

let setCurrentEngine = (engine: AudioEngine) => {
    currentEngine = engine;
};

export class AudioEngine {
    physicalEngine: AbstractPhysicalAudioEngine;

    // TODO: Consider making main bus a separate member.
    mainBusses = new Array<AudioBus>(); // TODO: Add public `addBus` and `removeBus` (except for first bus).

    voices = new Array<VirtualAudioVoice>();
    voicesDirty: boolean = false;
    inactiveVoiceIndex: number = 1;

    get mainBus(): AudioBus {
        return this.mainBusses[0];
    }

    constructor(physicalEngine: AbstractPhysicalAudioEngine, options?: any) {
        this.physicalEngine = physicalEngine;
        this.mainBusses.push(new AudioBus(this));

        setCurrentEngine(this);
    }

    getVoices(count: number, physicalSource: PhysicalAudioSource, options?: any): Array<VirtualAudioVoice> {
        const voices = new Array<VirtualAudioVoice>(count);
        if (count === 0) {
            return voices;
        }

        this.inactiveVoiceIndex = 0;

        for (let i = 0; i < count; i++) {
            while (this.inactiveVoiceIndex < this.voices.length && this.voices[this.inactiveVoiceIndex].state !== AudioVoiceState.Stopped) {
                this.inactiveVoiceIndex++;
            }

            const voice = this.inactiveVoiceIndex < this.voices.length ? this.voices[this.inactiveVoiceIndex] : this._createVoice();
            voices[i] = voice;

            voice.init(physicalSource, options);
        }

        this.voicesDirty = true;

        return voices;
    }

    freeVoices(voices: Array<VirtualAudioVoice>): void {
        for (const voice of voices) {
            voice.stop();
        }
        // TODO: Free resources.
    }

    /**
     * Updates virtual and physical voices.
     *
     * TODO: Add an option to make this get called automatically by the engine.
     */
    update(): void {
        // TODO: Uncomment this when observing virtual voice changes is implemented.
        // if (!this.voicesDirty) {
        //     return;
        // }

        // TODO: There maybe be a faster way to sort since we don't care about the order of inactive voices.
        //
        // Inactive voices are only required to be at the end of the array, after the active voices.
        //
        // Active voices need to be sorted amongs themselves using `compare`, but inactive voices don't. They just need
        // to come after all active voices in the array.
        //
        this.voices.sort((a, b) => a.compare(b));

        this.voicesDirty = false;
        this.physicalEngine.update(this.voices);
    }

    _createVoice(): VirtualAudioVoice {
        const voice = new VirtualAudioVoice();

        voice.onStateChangedObservable.add(() => {
            this.voicesDirty = true;
        });

        this.voices.push(voice);
        this.inactiveVoiceIndex = this.voices.length; // TODO: Still needed? Why is this being set past the end of the array here?

        return voice;
    }
}

abstract class AudioEngineItem {
    engine: AudioEngine;

    get physicalEngine(): AbstractPhysicalAudioEngine {
        return this.engine.physicalEngine;
    }

    constructor(engine?: AudioEngine, options?: any) {
        this.engine = engine ?? getCurrentEngine();
    }
}

export class AudioBus extends AudioEngineItem {
    physicalBus: PhysicalAudioBus;

    constructor(engine?: AudioEngine, options?: any) {
        super(engine);

        this.physicalBus = this.physicalEngine.createBus(options);
    }
}

export class Sound extends AudioEngineItem implements IDisposable {
    outputBus: AudioBus;
    physicalSource: PhysicalAudioSource;

    voices: Array<VirtualAudioVoice>;
    nextVoiceIndex: number = 0;

    paused: boolean = false;

    constructor(name: string, options?: any, engine?: AudioEngine) {
        super(engine);

        this.outputBus = options?.outputBus ?? this.engine.mainBus;
        this.physicalSource = options?.physicalSource ?? this.physicalEngine.createSource(options);
        this.voices = this.engine.getVoices(options?.maxVoices ?? 1, this.physicalSource, options);
    }

    public dispose(): void {
        this.stop();
        this.engine.freeVoices(this.voices);
    }

    play(): VirtualAudioVoice {
        this.resume();

        const voice = this.voices[this.nextVoiceIndex];
        voice.start();

        this.nextVoiceIndex = (this.nextVoiceIndex + 1) % this.voices.length;

        return voice;
    }

    stop(): void {
        for (const voice of this.voices) {
            voice.stop();
        }
    }

    pause(): void {
        if (this.paused) {
            return;
        }

        for (const voice of this.voices) {
            voice.pause();
        }

        this.paused = true;
    }

    resume(): void {
        if (!this.paused) {
            return;
        }

        for (const voice of this.voices) {
            voice.resume();
        }

        this.paused = false;
    }
}

// TODO: Move this. It doesn't belong in the logical layer.
export class WebAudioEngine extends AudioEngine {
    constructor(options?: any) {
        super(new WebAudioPhysicalEngine(), options);
    }
}

export let createDefaultEngine = (): AudioEngine => {
    return new WebAudioEngine();
};
