/* eslint-disable */

import * as _ from "./_design3.interfaces";
// import { Observable } from "../../Misc/observable";
// import { Nullable } from "../../types";

export abstract class AudioOutPin implements _.IAudioOutPin {
    connections: AudioConnection[] = [];
}

export abstract class AudioInPin implements _.IAudioInPin {
    connections: AudioConnection[] = [];
}

export abstract class AudioParam implements _.IAudioParam {
    input: AudioInPin;
    value: number;
}

export class AudioEffect implements _.IAudioProcessor {
    input: AudioInPin;
    output: AudioOutPin;
}

export class AudioEffectsChain implements _.IAudioProcessor {
    input: AudioInPin;
    output: AudioOutPin;

    chain: AudioEffect[];
}

export class AudioPositioner implements _.IAudioProcessor {
    input: AudioInPin;
    output: AudioOutPin;
}

export class AudioConnection implements _.IAudioConnection {
    input: AudioInPin;
    output: AudioOutPin;
}

export class AudioSend implements _.IAudioSend {
    parent: _.IAudioSender;
    input: AudioInPin;
    output: AudioOutPin;
    type: "pre-effects" | "pre-fader" | "post-fader" = "post-fader";
    gain: AudioParam;

    params = new Array<AudioParam>();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class AudioEngine {
    devices: AudioDevice[];
}

export class AudioDevice implements _.IAudioDestination {
    input: AudioInPin;
}

export class AudioBus implements _.IAudioProcessor, _.IAudioSender {
    input: AudioInPin;
    output: AudioOutPin;

    preEffectsOutput: AudioOutPin;
    preFaderOutput: AudioOutPin;
    postFaderOutput: AudioOutPin;

    effects: AudioEffectsChain;
    fader: AudioEffect;

    sends: AudioSend[];
}

export class AudioOutputBus extends AudioBus {
    device: AudioDevice;
}

export class AudioAuxBus extends AudioBus {
    positioner: AudioPositioner;
}

export class Sound implements _.IAudioSource, _.IAudioSender {
    output: AudioOutPin;

    preEffectsOutput: AudioOutPin;
    preFaderOutput: AudioOutPin;
    postFaderOutput: AudioOutPin;

    effects: AudioEffectsChain;
    positioner: AudioPositioner;
    fader: AudioEffect;

    sends: AudioSend[];
}

export class AudioAnalyzer implements _.IAudioDestination {
    input: AudioInPin;
}
