/* eslint-disable */

import { Nullable } from "../../types";

// #region Enums and Interfaces

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
    _inPin: AudioPin;
}

// #endregion
// #region Module-level private functions

let deferOptimizeConnectionsTimeoutId: Nullable<NodeJS.Timeout> = null;

function deferOptimizeConnections(engine: AudioEngine) {
    if (deferOptimizeConnectionsTimeoutId) {
        clearTimeout(deferOptimizeConnectionsTimeoutId);
    }
    deferOptimizeConnectionsTimeoutId = setTimeout(() => {
        deferOptimizeConnectionsTimeoutId = null;
        engine.optimizeConnections();
    }, 0);
}

function deferUpdateConnections(parent: IAudioNode) {
    if (parent._updateConnectionsPending) {
        return;
    }
    parent._updateConnectionsPending = true;
    setTimeout(() => {
        parent._updateConnections();
        parent._updateConnectionsPending = false;
        deferOptimizeConnections(parent._engine);
    }, 0);
}

// #endregion
// #region Basic connection classes

export class AudioPin {
    _parent: IAudioNode;
    _connections = new Array<AudioConnection>();
    _optimizedConnections: Nullable<Array<OptimizedAudioConnection>> = null;

    constructor(parent: IAudioNode) {
        this._parent = parent;
    }

    _findConnection(pin: AudioPin): Nullable<AudioConnection> {
        for (const connection of this._connections) {
            if (connection._outPin === pin) {
                return connection;
            }
        }
        for (const connection of this._connections) {
            if (connection._inPin === pin) {
                return connection;
            }
        }
        return null;
    }

    _addConnection(connection: AudioConnection) {
        this._connections.push(connection);
        deferUpdateConnections(this._parent);
    }

    _removeConnection(connection: AudioConnection, dispose = true) {
        const index = this._connections.indexOf(connection);
        if (index !== -1) {
            this._connections.splice(index, 1);
            deferUpdateConnections(this._parent);
        }
    }

    _removeAllConnections() {
        for (const connection of this._connections) {
            this._removeConnection(connection);
        }
    }

    removeConnectedPin(pin: AudioPin) {
        const connection = this._findConnection(pin);
        if (connection) {
            this._removeConnection(connection);
        }
    }
}

export class AudioConnection {
    _inPin: AudioPin;
    _outPin: AudioPin;

    get inPin() {
        return this._inPin;
    }

    set inPin(inPin: AudioPin) {
        if (this._inPin === inPin) {
            return;
        }
        this._inPin._removeConnection(this);
        this._inPin = inPin;
        this._inPin._addConnection(this);
    }

    get outPin() {
        return this._outPin;
    }

    set outPin(outPin: AudioPin) {
        if (this._outPin === outPin) {
            return;
        }
        this._outPin._removeConnection(this);
        this._outPin = outPin;
        this._outPin._addConnection(this);
    }

    // TODO: Swap in/out args so left arg is upstream pin and right arg is downstream pin.
    constructor(inPin: AudioPin, outPin: AudioPin) {
        this._inPin = inPin;
        this._outPin = outPin;

        this._inPin._addConnection(this);
        this._outPin._addConnection(this);
    }
}

export abstract class AudioSend extends AudioConnection {
    _parent: AudioSender;
    _type: SendType;
    _gainParam: AudioParam;
    _params: AudioParam[];
    _updateConnectionsPending = false;

    get type() {
        return this._type;
    }

    set type(value) {
        if (this._type === value) {
            return;
        }
        this._parent._getSendOutPin(this._type)._removeConnection(this);
        this._type = value;
        this._parent._getSendOutPin(this._type)._addConnection(this);
    }

    get gainParam() {
        return this._gainParam;
    }

    get params(): Array<AudioParam> {
        return this._params;
    }

    constructor(parent: AudioSender, outPin: AudioPin, options?: IAudioSendOptions) {
        super(parent._getSendOutPin(options?.type ?? SendType.PostFader), outPin);
        this._parent = parent;
        this._type = options?.type ?? SendType.PostFader;
    }

    abstract _updateConnections(): void;
}

// #endregion
// #region Optimized connection classes

export abstract class OptimizedAudioConnection {
    _sourcePin: AudioPin;
    _destinationPin: AudioPin;
    _accumulatedGain: number;

    get engine() {
        return this._destinationPin._parent._engine;
    }

    constructor(destinationPin: AudioPin) {
        this._destinationPin = destinationPin;
        this._destinationPin._optimizedConnections?.push(this);
    }
}

class AudioConnectionOptimizer {
    _engine: AudioEngine;
    _connectionsToVisit = new Array<AudioConnection>();
    _visitedConnections = new Array<AudioConnection>();

    constructor(engine: AudioEngine) {
        this._engine = engine;
        for (const device of this._engine._devices) {
            this._connectionsToVisit.push(...device._inPin._connections);
        }
    }

    _optimize() {
        console.log("AudioConnectionOptimizer._optimize ...");
        console.log(this._connectionsToVisit);
    }
}

// #region Base classes

export abstract class AudioSender implements IAudioNode {
    _parent: IAudioNode;
    _outPin = new AudioPin(this);
    _preEffectsOutPin = new AudioPin(this);
    _preFaderOutPin = new AudioPin(this);
    _effects: AudioEffectsChain;
    _sends: AudioSend[];
    _gainParam: AudioParam;
    _params = new Array<AudioParam>();
    _updateConnectionsPending = false;

    get _engine() {
        return this._parent._engine;
    }

    get gainParam() {
        return this._gainParam;
    }

    get params(): Array<AudioParam> {
        return this._params;
    }

    constructor(parent: IAudioNode) {
        this._parent = parent;
    }

    connect(destination: IAudioReceiver) {
        this._engine.connectPins(this._outPin, destination._inPin);
        deferUpdateConnections(this);
    }

    disconnect(destination: IAudioReceiver) {
        this._outPin.removeConnectedPin(destination._inPin);
    }

    _getSendOutPin(type: SendType) {
        return type === SendType.PostFader ? this._outPin : type === SendType.PreEffects ? this._preEffectsOutPin : this._preFaderOutPin;
    }

    addSend(destination: IAudioReceiver, options?: IAudioSendOptions) {
        const send = this._engine.createSend(this, destination._inPin, options);
        this._sends.push(send);
    }

    removeSend(send: AudioSend) {
        const index = this._sends.indexOf(send);
        if (index !== -1) {
            const outPin = this._getSendOutPin(send.type);
            outPin._removeConnection(send);
            this._sends.splice(index, 1);
        }
    }

    abstract _updateConnections(): void;
}

export abstract class AudioProcessor implements IAudioNode {
    _parent: IAudioNode;
    _inPin = new AudioPin(this);
    _outPin = new AudioPin(this);
    _optimize: boolean;
    _params = new Array<AudioParam>();

    get _engine() {
        return this._parent._engine;
    }

    get params(): Array<AudioParam> {
        return this._params;
    }

    constructor(parent: IAudioNode) {
        this._parent = parent;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioEffect extends AudioProcessor {
    _bypass = false;

    set parent(parent: IAudioNode) {
        this._parent = parent;
    }

    constructor(parent: IAudioNode) {
        super(parent);
    }

    connect(destination: AudioEffect) {
        this._engine.connectPins(this._outPin, destination._inPin);
    }

    disconnect() {
        this._outPin._removeAllConnections();
    }

    _updateConnections(): void {
        // TODO: Make abstract when WebAudio classes are added.
    }
}

export abstract class AudioDestination implements IAudioNode, IAudioReceiver {
    _parent: IAudioNode;
    _inPin = new AudioPin(this);
    _params = new Array<AudioParam>();
    _updateConnectionsPending = false;

    get _engine() {
        return this._parent._engine;
    }

    get params(): Array<AudioParam> {
        return this._params;
    }

    constructor(parent: IAudioNode) {
        this._parent = parent;
    }

    abstract _updateConnections(): void;
}

// #endregion
// #region Internal node classes

export abstract class AudioParam implements IAudioNode {
    _parent: IAudioNode;
    _inPin = new AudioPin(this);
    _value: number;

    get _engine() {
        return this._parent._engine;
    }

    constructor(parent: IAudioNode) {
        this._parent = parent;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export class AudioGain extends AudioEffect {
    _gainParam: AudioParam;

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
        effect._parent = this;
        this._getEffects().push(effect);
        deferUpdateConnections(this);
    }

    setEffect(effect: AudioEffect, index: number) {
        effect._parent = this;
        this._getEffects(index + 1)[index] = effect;
        deferUpdateConnections(this);
    }

    removeEffect(effect: AudioEffect) {
        const index = this._effects?.indexOf(effect) ?? -1;
        if (index !== -1) {
            effect._inPin._removeAllConnections();
            effect._outPin._removeAllConnections();
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
        return this._distanceGain?._gainParam._value ?? 1;
    }

    set distanceGain(value: number) {
        this._getDistanceGain()._gainParam._value = value;
    }

    get equalPowerPannerGain(): number {
        return this._equalPowerPannerGain?._gainParam._value ?? 0;
    }

    set equalPowerPannerGain(value: number) {
        this._getEqualPowerPannerGain()._gainParam._value = value;
        if (0 < value) {
            this._getEqualPowerPanner();
        }
    }

    get hrtfPannerGain(): number {
        return this._equalPowerPannerGain?._gainParam._value ?? 0;
    }

    set hrtfPannerGain(value: number) {
        this._getHrtfPannerGain()._gainParam._value = value;
        if (0 < value) {
            this._getHrtfPanner();
        }
    }

    constructor(parent: IAudioNode) {
        super(parent);
    }

    _updateConnections(): void {
        if (this._equalPowerPannerGain && this._hrtfPannerGain) {
            this._getPannerMixer();
        }
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
}

// #endregion
// #region Abstract top-level node classes

export abstract class AudioEngine implements IAudioNode {
    _engine = this;
    _devices = new Array<AudioDevice>();
    _updateConnectionsPending: boolean;

    abstract connectPins(inPin: AudioPin, outPin: AudioPin): void;
    abstract createEqualPowerPanner(parent: IAudioNode): EqualPowerAudioPanner;
    abstract createGain(parent: IAudioNode): AudioGain;
    abstract createHrtfPanner(parent: IAudioNode): HrtfAudioPanner;
    abstract createMixer(parent: IAudioNode): AudioMixer;
    abstract createOptimizedConnection(destinationPin: AudioPin): OptimizedAudioConnection;
    abstract createSend(parent: AudioSender, outPin: AudioPin, options?: IAudioSendOptions): AudioSend;

    abstract _updateConnections(): void;

    _addDevice(device: AudioDevice) {
        if (this._devices.includes(device)) {
            return;
        }
        this._devices.push(device);
    }

    _removeDevice(device: AudioDevice) {
        const index = this._devices.indexOf(device);
        if (index !== -1) {
            this._devices.splice(index, 1);
        }
    }

    optimizeConnections() {
        const optimizer = new AudioConnectionOptimizer(this);
        optimizer._optimize();
    }
}

export abstract class AudioDevice extends AudioDestination implements IAudioNode {
    constructor(engine: AudioEngine) {
        super(engine);
        engine._addDevice(this);
    }
}

export abstract class AudioBus extends AudioSender implements IAudioReceiver {
    _inPin = new AudioPin(this);
    _optimize: boolean;

    constructor(device: AudioDevice) {
        super(device._engine);
        this.connect(device);
    }
}

export abstract class AudioOutputBus extends AudioBus {
    abstract get device(): AudioDevice;
}

export abstract class AudioAuxBus extends AudioBus {
    _outputBus: AudioOutputBus;
    _positioner: AudioPositioner;
}

export abstract class Sound extends AudioSender {
    _outputBus: AudioOutputBus;
    _positioner: AudioPositioner;
}

export abstract class AudioAnalyzer extends AudioDestination {
    //
}

// #endregion
