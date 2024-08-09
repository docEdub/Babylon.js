/* eslint-disable */

import { Nullable } from "../../types";

export enum SendType {
    PreEffects,
    PreFader,
    PostFader,
}

export interface IAudioSendOptions {
    type?: SendType;
    gain?: number;
}

export interface IAudioNode {
    _engine: AudioEngine;
    _updateConnectionsPending: boolean;
    _updateConnections(): void;
}

export interface IAudioReceiver {
    inPin: AudioPin;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function deferUpdateConnections(parent: IAudioNode) {
    if (parent._updateConnectionsPending) {
        return;
    }
    parent._updateConnectionsPending = true;
    setTimeout(() => {
        parent._updateConnections();
        parent._updateConnectionsPending = false;
    }, 0);
}

export class AudioPin {
    parent: IAudioNode;
    connections: AudioConnection[] = [];

    constructor(parent: IAudioNode) {
        this.parent = parent;
    }

    findConnection(pin: AudioPin): Nullable<AudioConnection> {
        for (const connection of this.connections) {
            if (connection.outPin === pin) {
                return connection;
            }
        }
        for (const connection of this.connections) {
            if (connection.inPin === pin) {
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
}

export class AudioConnection {
    _inPin: AudioPin;
    _outPin: AudioPin;
    _accumulatedGain: number;

    get inPin() {
        return this._inPin;
    }

    set inPin(inPin: AudioPin) {
        if (this._inPin === inPin) {
            return;
        }
        this._inPin.removeConnection(this);
        this._inPin = inPin;
        this._inPin.addConnection(this);
    }

    get outPin() {
        return this._outPin;
    }

    set outPin(outPin: AudioPin) {
        if (this._outPin === outPin) {
            return;
        }
        this._outPin.removeConnection(this);
        this._outPin = outPin;
        this._outPin.addConnection(this);
    }

    // TODO: Swap in/out args so left arg is upstream pin and right arg is downstream pin.
    constructor(inPin: AudioPin, outPin: AudioPin) {
        this._inPin = inPin;
        this._outPin = outPin;

        this._inPin.addConnection(this);
        this._outPin.addConnection(this);
    }
}

export abstract class AudioSend extends AudioConnection {
    _parent: AudioSender;
    _type: SendType;

    get type() {
        return this._type;
    }

    set type(value) {
        if (this._type === value) {
            return;
        }
        this._parent._getSendOutPin(this._type).removeConnection(this);
        this._type = value;
        this._parent._getSendOutPin(this._type).addConnection(this);
    }

    _gainParam: AudioParam;

    get gainParam() {
        return this._gainParam;
    }

    _params: AudioParam[];

    get params(): Array<AudioParam> {
        return this._params;
    }

    constructor(parent: AudioSender, outPin: AudioPin, options?: IAudioSendOptions) {
        super(parent._getSendOutPin(options?.type ?? SendType.PostFader), outPin);
        this._parent = parent;
        this._type = options?.type ?? SendType.PostFader;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioParam implements IAudioNode {
    _parent: IAudioNode;

    get _engine() {
        return this._parent._engine;
    }

    inPin = new AudioPin(this);
    value: number;

    constructor(parent: IAudioNode) {
        this._parent = parent;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioSender implements IAudioNode {
    _parent: IAudioNode;

    get _engine() {
        return this._parent._engine;
    }

    outPin = new AudioPin(this);

    preEffectsOutPin = new AudioPin(this);
    preFaderOutPin = new AudioPin(this);

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

    constructor(parent: IAudioNode) {
        this._parent = parent;
    }

    connect(destination: IAudioReceiver) {
        this._engine.connectPins(this.outPin, destination.inPin);
        deferUpdateConnections(this);
    }

    disconnect(destination: IAudioReceiver) {
        this.outPin.removeConnectedPin(destination.inPin);
    }

    _getSendOutPin(type: SendType) {
        return type === SendType.PostFader ? this.outPin : type === SendType.PreEffects ? this.preEffectsOutPin : this.preFaderOutPin;
    }

    addSend(destination: IAudioReceiver, options?: IAudioSendOptions) {
        const send = this._engine.createSend(this, destination.inPin, options);
        this.sends.push(send);
    }

    removeSend(send: AudioSend) {
        const index = this.sends.indexOf(send);
        if (index !== -1) {
            const outPin = this._getSendOutPin(send.type);
            outPin.removeConnection(send);
            this.sends.splice(index, 1);
        }
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioProcessor implements IAudioNode {
    _parent: IAudioNode;
    _params = new Array<AudioParam>();

    get _engine() {
        return this._parent._engine;
    }

    get params(): Array<AudioParam> {
        return this._params;
    }

    inPin = new AudioPin(this);
    outPin = new AudioPin(this);

    optimize: boolean;

    constructor(parent: IAudioNode) {
        this._parent = parent;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioEffect extends AudioProcessor {
    bypass = false;

    set parent(parent: IAudioNode) {
        this._parent = parent;
    }

    constructor(parent: IAudioNode) {
        super(parent);
    }

    connect(destination: AudioEffect) {
        this._engine.connectPins(this.outPin, destination.inPin);
    }

    disconnect() {
        this.outPin.removeAllConnections();
    }

    _updateConnections(): void {
        // TODO: Make abstract when WebAudio classes are added.
    }
}

export class AudioGain extends AudioEffect {
    gainParam: AudioParam;

    constructor(parent: IAudioNode) {
        super(parent);
    }
}

export class AudioMixer extends AudioEffect {
    constructor(parent: IAudioNode) {
        super(parent);
    }
}

export class EqualPowerAudioPanner extends AudioEffect {
    constructor(parent: IAudioNode) {
        super(parent);
    }
}

export class HrtfAudioPanner extends AudioEffect {
    constructor(parent: IAudioNode) {
        super(parent);
    }
}

export abstract class AudioEffectsChain extends AudioProcessor {
    _effects: Nullable<Array<Nullable<AudioEffect>>> = null;

    constructor(parent: IAudioNode) {
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
            effect.inPin.removeAllConnections();
            effect.outPin.removeAllConnections();
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
}

export abstract class AudioPositioner extends AudioProcessor {
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

    constructor(parent: IAudioNode) {
        super(parent);
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

    _updateConnections(): void {
        if (this._equalPowerPannerGain && this._hrtfPannerGain) {
            this._getPannerMixer();
        }
    }
}

export abstract class AudioDestination implements IAudioNode, IAudioReceiver {
    _parent: IAudioNode;
    _params = new Array<AudioParam>();

    get _engine() {
        return this._parent._engine;
    }

    get params(): Array<AudioParam> {
        return this._params;
    }

    inPin = new AudioPin(this);

    constructor(parent: IAudioNode) {
        this._parent = parent;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export abstract class AudioEngine implements IAudioNode {
    _engine = this;
    _devices = new Array<AudioDevice>();

    abstract connectPins(inPin: AudioPin, outPin: AudioPin): void;
    abstract createEqualPowerPanner(parent: IAudioNode): EqualPowerAudioPanner;
    abstract createGain(parent: IAudioNode): AudioGain;
    abstract createHrtfPanner(parent: IAudioNode): HrtfAudioPanner;
    abstract createMixer(parent: IAudioNode): AudioMixer;
    abstract createSend(parent: AudioSender, outPin: AudioPin, options?: IAudioSendOptions): AudioSend;

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

    _updateConnectionsPending: boolean;
    abstract _updateConnections(): void;
}

export abstract class AudioDevice extends AudioDestination implements IAudioNode {
    constructor(engine: AudioEngine) {
        super(engine);
    }
}

export abstract class AudioBus extends AudioSender implements IAudioReceiver {
    inPin = new AudioPin(this);
    optimize: boolean;
}

export abstract class AudioOutputBus extends AudioBus {
    abstract get device(): AudioDevice;
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
