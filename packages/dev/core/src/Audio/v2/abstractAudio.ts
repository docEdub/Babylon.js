/* eslint-disable */

import * as _ from "./abstractAudio.interfaces";
import { Nullable } from "../../types";

interface IAudioSendOptions {
    type: _.SendType;
    gain: number;
}

interface IAudioUpdatable {
    _updateConnectionsPending: boolean;
    _updateConnections(): void;
}

function deferUpdateConnections(parent: Nullable<IAudioUpdatable>) {
    if (!parent) {
        return;
    }
    if (parent._updateConnectionsPending) {
        return;
    }
    parent._updateConnectionsPending = true;
    setTimeout(() => {
        parent._updateConnections();
        parent._updateConnectionsPending = false;
    }, 0);
}

export class AudioPin implements _.IAudioPin {
    parent: Nullable<IAudioUpdatable> = null;
    connections: AudioConnection[] = [];

    constructor(parent: Nullable<IAudioUpdatable> = null) {
        this.parent = parent;
    }

    findConnection(pin: AudioPin): Nullable<AudioConnection> {
        for (const connection of this.connections) {
            if (connection.output === pin) {
                return connection;
            }
        }
        for (const connection of this.connections) {
            if (connection.input === pin) {
                return connection;
            }
        }
        return null;
    }

    addConnection(connection: AudioConnection) {
        this.connections.push(connection);
        deferUpdateConnections(this.parent);
    }

    removeConnection(connection: AudioConnection, dispose = true) {
        const index = this.connections.indexOf(connection);
        if (index !== -1) {
            this.connections.splice(index, 1);
            deferUpdateConnections(this.parent);
        }
    }

    removeAllConnections() {
        for (const connection of this.connections) {
            this.removeConnection(connection);
        }
    }

    removeConnectedPin(pin: AudioPin) {
        const connection = this.findConnection(pin);
        if (connection) {
            this.removeConnection(connection);
        }
    }

    static readonly Null = new AudioPin();
}

export class AudioConnection implements _.IAudioConnection {
    _input: AudioPin;
    _output: AudioPin;

    get input() {
        return this._input;
    }

    set input(input: AudioPin) {
        if (this._input === input) {
            return;
        }
        this._input.removeConnection(this);
        this._input = input;
        this._input.addConnection(this);
    }

    get output() {
        return this._output;
    }

    set output(output: AudioPin) {
        if (this._output === output) {
            return;
        }
        this._output.removeConnection(this);
        this._output = output;
        this._output.addConnection(this);
    }

    constructor(input: AudioPin, output: AudioPin) {
        this._input = input;
        this._output = output;

        this._input.addConnection(this);
        this._output.addConnection(this);
    }
}

export abstract class AudioSend extends AudioConnection implements _.IAudioSend {
    _parent: AudioSender;
    _type: _.SendType;

    get type() {
        return this._type;
    }

    set type(value) {
        if (this._type === value) {
            return;
        }
        this._parent._getSendOutputPin(this._type).removeConnection(this);
        this._type = value;
        this._parent._getSendOutputPin(this._type).addConnection(this);
    }

    _gainParam: AudioParam;

    get gainParam() {
        return this._gainParam;
    }

    _params: AudioParam[];

    get params(): Array<AudioParam> {
        return this._params;
    }

    constructor(parent: AudioSender, output: AudioPin, options?: IAudioSendOptions) {
        super(parent._getSendOutputPin(options?.type ?? _.SendType.PostFader), output);
        this._parent = parent;
        this._type = options?.type ?? _.SendType.PostFader;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioParam implements _.IAudioParam {
    parent: IAudioUpdatable;
    input = new AudioPin(this);
    value: number;

    constructor(parent: IAudioUpdatable) {
        this.parent = parent;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioSender implements _.IAudioSender {
    engine: AudioEngine;
    output = new AudioPin(this);

    preEffectsOutput = new AudioPin(this);
    preFaderOutput = new AudioPin(this);

    effects: AudioEffectsChain;

    sends: AudioSend[];

    _gainParam: AudioParam;

    get gainParam() {
        return this._gainParam;
    }

    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    constructor(engine: AudioEngine) {
        this.engine = engine;
    }

    connect(destination: _.IAudioInput) {
        new AudioConnection(this.output, destination.input as AudioPin);
        deferUpdateConnections(this);
    }

    disconnect(destination: _.IAudioInput) {
        this.output.removeConnectedPin(destination.input as AudioPin);
    }

    _getSendOutputPin(type: _.SendType) {
        return type === _.SendType.PostFader ? this.output : type === _.SendType.PreEffects ? this.preEffectsOutput : this.preFaderOutput;
    }

    addSend(destination: _.IAudioInput, options?: IAudioSendOptions) {
        const send = this.engine.createSend(this, destination.input as AudioPin, options);
        this.sends.push(send);
    }

    removeSend(send: AudioSend) {
        const index = this.sends.indexOf(send);
        if (index !== -1) {
            const outputPin = this._getSendOutputPin(send.type);
            outputPin.removeConnection(send);
            this.sends.splice(index, 1);
        }
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioProcessor implements _.IAudioProcessor {
    parent: Nullable<IAudioUpdatable> = null;
    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    input = AudioPin.Null;
    output = AudioPin.Null;
    optimize: boolean;

    constructor(parent: Nullable<IAudioUpdatable> = null) {
        this.parent = parent;
    }

    _updateConnectionsPending = false;

    _updateConnections(): void {
        deferUpdateConnections(this.parent);
    }
}

export abstract class AudioEffect extends AudioProcessor {
    bypass = false;

    constructor(parent: Nullable<IAudioUpdatable> = null) {
        super(parent);
    }

    connect(destination: AudioEffect) {
        new AudioConnection(this.output, destination.input);
    }

    disconnect() {
        this.output.removeAllConnections();
    }
}

export abstract class AudioGain extends AudioEffect {
    gainParam: AudioParam;

    constructor(parent: IAudioUpdatable) {
        super(parent);
    }
}

export abstract class AudioMixer extends AudioEffect {
    constructor(parent: IAudioUpdatable) {
        super(parent);
    }
}

export abstract class EqualPowerAudioPanner extends AudioEffect {
    constructor(parent: IAudioUpdatable) {
        super(parent);
    }
}

export abstract class HrtfAudioPanner extends AudioEffect {
    constructor(parent: IAudioUpdatable) {
        super(parent);
    }
}

export abstract class AudioEffectsChain extends AudioProcessor {
    _effects: Nullable<Array<Nullable<AudioEffect>>> = null;

    constructor(parent: IAudioUpdatable) {
        super(parent);
    }

    addEffect(effect: AudioEffect) {
        if (this._effects?.includes(effect)) {
            return;
        }
        effect.parent = this;
        this._getEffects().push(effect);
        deferUpdateConnections(this);
    }

    setEffect(effect: AudioEffect, index: number) {
        effect.parent = this;
        this._getEffects(index + 1)[index] = effect;
        deferUpdateConnections(this);
    }

    removeEffect(effect: AudioEffect) {
        const index = this._effects?.indexOf(effect) ?? -1;
        if (index !== -1) {
            effect.parent = null;
            effect.input.removeAllConnections();
            effect.output.removeAllConnections();
            this._effects![index] = null;
            deferUpdateConnections(this);
        }
    }

    _getEffects(maxSize: number = 1): Array<Nullable<AudioEffect>> {
        if (!this._effects) {
            this._effects = new Array<Nullable<AudioEffect>>();
        }
        this._effects.length = Math.max(this._effects.length, maxSize);
        return this._effects;
    }

    override _updateConnections() {
        if (this._effects) {
            let previousEffect: Nullable<AudioEffect> = null;
            let i = 0;
            for (; i < this._effects.length; i++) {
                const effect = this._effects[i];
                if (!effect) {
                    continue;
                }

                previousEffect = effect;

                if (this.input !== effect.input) {
                    effect.input?.removeAllConnections();
                    this.input?.removeAllConnections();
                    this.input = effect.input;
                    break;
                }
            }
            for (; i < this._effects.length; i++) {
                const effect = this._effects[i];
                if (!effect) {
                    continue;
                }
                if (previousEffect?.output !== effect.input) {
                    effect.input.removeAllConnections();
                    previousEffect?.disconnect();
                    previousEffect?.connect(effect);
                }
                previousEffect = effect;
            }
            if (this.output !== previousEffect?.output) {
                previousEffect?.output?.removeAllConnections();
                this.output?.removeAllConnections();
                this.output = previousEffect?.output ?? AudioPin.Null;
            }
        } else {
            if (this.input) {
                this.input.removeAllConnections();
                this.input = AudioPin.Null;
            }
            if (this.output) {
                this.output.removeAllConnections();
                this.output = AudioPin.Null;
            }
        }
        super._updateConnections();
    }
}

export abstract class AudioPositioner extends AudioProcessor {
    _engine: AudioEngine;
    _distanceGain: Nullable<AudioGain> = null;
    _equalPowerPanner: Nullable<EqualPowerAudioPanner> = null;
    _equalPowerPannerGain: Nullable<AudioGain> = null;
    _hrtfPanner: Nullable<HrtfAudioPanner> = null;
    _hrtfPannerGain: Nullable<AudioGain> = null;
    _pannerMixer: Nullable<AudioMixer> = null;

    get distanceGain(): number {
        return this._distanceGain?.gainParam.value ?? 1;
    }

    set distanceGain(value: number) {
        this._getDistanceGain().gainParam.value = value;
    }

    get equalPowerPannerGain(): number {
        return this._equalPowerPannerGain?.gainParam.value ?? 0;
    }

    set equalPowerPannerGain(value: number) {
        this._getEqualPowerPannerGain().gainParam.value = value;
        if (0 < value) {
            this._getEqualPowerPanner();
        }
    }

    get hrtfPannerGain(): number {
        return this._equalPowerPannerGain?.gainParam.value ?? 0;
    }

    set hrtfPannerGain(value: number) {
        this._getHrtfPannerGain().gainParam.value = value;
        if (0 < value) {
            this._getHrtfPanner();
        }
    }

    constructor(parent: IAudioUpdatable, engine: AudioEngine) {
        super(parent);
        this._engine = engine;
    }

    _getDistanceGain(): AudioGain {
        if (!this._distanceGain) {
            this._distanceGain = this._engine.createGain(this);
        }
        return this._distanceGain;
    }

    _getEqualPowerPanner(): EqualPowerAudioPanner {
        if (!this._equalPowerPanner) {
            this._equalPowerPanner = this._engine.createEqualPowerPanner(this);
        }
        return this._equalPowerPanner;
    }

    _getEqualPowerPannerGain(): AudioGain {
        if (!this._equalPowerPannerGain) {
            this._equalPowerPannerGain = this._engine.createGain(this);
            deferUpdateConnections(this);
        }
        return this._equalPowerPannerGain;
    }

    _getHrtfPanner(): HrtfAudioPanner {
        if (!this._hrtfPanner) {
            this._hrtfPanner = this._engine.createHrtfPanner(this);
            deferUpdateConnections(this);
        }
        return this._hrtfPanner;
    }

    _getHrtfPannerGain(): AudioGain {
        if (!this._hrtfPannerGain) {
            this._hrtfPannerGain = this._engine.createGain(this);
            deferUpdateConnections(this);
        }
        return this._hrtfPannerGain;
    }

    _getPannerMixer(): AudioMixer {
        if (!this._pannerMixer) {
            this._pannerMixer = this._engine.createMixer(this);
            deferUpdateConnections(this);
        }
        return this._pannerMixer;
    }

    override _updateConnections(): void {
        if (this._equalPowerPannerGain && this._hrtfPannerGain) {
            this._getPannerMixer();
        }
        super._updateConnections();
    }
}

export abstract class AudioDestination implements _.IAudioDestination {
    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    input: AudioPin;

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export abstract class AudioEngine {
    _devices = new Array<AudioDevice>();

    abstract createEqualPowerPanner(parent: IAudioUpdatable): EqualPowerAudioPanner;
    abstract createGain(parent: IAudioUpdatable): AudioGain;
    abstract createHrtfPanner(parent: IAudioUpdatable): HrtfAudioPanner;
    abstract createMixer(parent: IAudioUpdatable): AudioMixer;
    abstract createSend(parent: AudioSender, output: AudioPin, options?: IAudioSendOptions): AudioSend;

    addDevice(device: AudioDevice) {
        if (this._devices.includes(device)) {
            return;
        }
        this._devices.push(device);
    }

    removeDevice(device: AudioDevice) {
        const index = this._devices.indexOf(device);
        if (index !== -1) {
            this._devices.splice(index, 1);
        }
    }
}

export abstract class AudioDevice extends AudioDestination {
    //
}

export abstract class AudioBus extends AudioSender implements _.IAudioProcessor {
    input: AudioPin;
    optimize: boolean;
}

export abstract class AudioOutputBus extends AudioBus {
    device: AudioDevice;
}

export abstract class AudioAuxBus extends AudioBus {
    outputBus: AudioOutputBus;
    positioner: AudioPositioner;
}

export abstract class Sound extends AudioSender {
    outputBus: AudioOutputBus;
    positioner: AudioPositioner;
}

export abstract class AudioAnalyzer extends AudioDestination {
    //
}
