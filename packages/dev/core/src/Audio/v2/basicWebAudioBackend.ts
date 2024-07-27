/* eslint-disable */

import type { IBasicAudioBusBackend, IBasicAudioEngineBackend, IBasicAudioPositionerBackend, IBasicAudioSourceBackend, IBasicAudioVoiceBackend } from "./basicBackend";
import { IBasicCommonSoundOptions, IBasicSoundSourceOptions, IBasicStaticSoundOptions, IBasicStreamSoundOptions } from "./basicOptions";
import { AudioVoiceState } from "./common";
import { Vector3 } from "../../Maths/math.vector";
import { Logger } from "../../Misc/logger";
import { Observable } from "../../Misc/observable";
import { IDisposable } from "../../scene";
import { Nullable } from "../../types";

export class BasicWebAudioEngine implements IBasicAudioEngineBackend, IDisposable {
    audioContext: AudioContext;

    mainOutputBus: BasicWebAudioBus;

    onUnlockObservable = new Observable<BasicWebAudioEngine>();

    get currentTime(): number {
        return this.audioContext.currentTime;
    }

    get unlocked(): boolean {
        return this.audioContext.state !== "suspended";
    }

    constructor(options?: any) {
        this.audioContext = options?.audioContext ?? new AudioContext();
        this.mainOutputBus = new BasicWebAudioBus(this, options);

        this.mainOutputBus.outputNode?.connect(this.audioContext.destination);

        // TODO: See WebXR button for an example of how to handle this in the UI.
        if (!this.unlocked) {
            if (options?.autoUnlock !== false) {
                const onWindowClick = () => {
                    this.unlock();
                    window.removeEventListener("click", onWindowClick);
                };
                window.addEventListener("click", onWindowClick);
            }
        }
    }

    dispose(): void {
        this.audioContext.removeEventListener("statechange", this._onAudioContextStateChange);
        this.audioContext.close();
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
        this.audioContext.addEventListener("statechange", this._onAudioContextStateChange.bind(this));
        this.audioContext.resume();
    }

    private _onAudioContextStateChange(): void {
        if (this.unlocked) {
            console.log("Audio context unlocked.");
            this.onUnlockObservable.notifyObservers(this);
            this.audioContext.removeEventListener("statechange", this._onAudioContextStateChange);
        }
    }
}

abstract class AbstractWebAudioSubGraph {
    abstract inputNode: Nullable<AudioNode>;
    abstract outputNode: Nullable<AudioNode>;
}

abstract class AbstractWebAudioGraphItem extends AbstractWebAudioSubGraph {
    engine: BasicWebAudioEngine;

    effectChain?: BasicWebAudioEffectChain;
    positioner?: BasicWebAudioPositioner;

    outputBus: Nullable<BasicWebAudioBus>;
    auxSendBusses: Nullable<Array<BasicWebAudioBus>>;

    constructor(engine: BasicWebAudioEngine, options?: any) {
        super();
        this.engine = engine;
    }

    setMainOutputBus(bus: BasicWebAudioBus): void {
        bus.addInputItem(this);
        this.outputBus = bus;
        this.outputNode?.connect(bus.inputNode!);
    }

    protected _getAudioContext(): AudioContext {
        return this.engine.audioContext;
    }
}

export class BasicWebAudioEffectChain extends AbstractWebAudioSubGraph {
    nodes: Array<AudioNode>;

    get inputNode(): Nullable<AudioNode> {
        return this.nodes[0];
    }

    get outputNode(): Nullable<AudioNode> {
        return this.nodes[this.nodes.length - 1];
    }
}

export class BasicWebAudioPositioner extends AbstractWebAudioSubGraph implements IBasicAudioPositionerBackend {
    nodes: Array<AudioNode>;

    get inputNode(): Nullable<AudioNode> {
        return this.nodes[0]; // varies depending on settings
    }

    get outputNode(): Nullable<AudioNode> {
        return this.nodes[this.nodes.length - 1]; // varies depending on settings.
    }

    get position(): Vector3 {
        return new Vector3();
    }
    set position(position: Vector3) {}
}

export class BasicWebAudioBus extends AbstractWebAudioGraphItem implements IBasicAudioBusBackend {
    _inputItems = new Array<AbstractWebAudioGraphItem>();
    _outputGainNode: GainNode;

    get inputNode(): Nullable<AudioNode> {
        return this._outputGainNode;
    }

    get outputNode(): Nullable<AudioNode> {
        return this._outputGainNode;
    }

    constructor(engine: BasicWebAudioEngine, options?: any) {
        super(engine, options);
        this._outputGainNode = new GainNode(this._getAudioContext());
    }

    addInputItem(item: AbstractWebAudioGraphItem): void {
        this._inputItems.push(item);
    }
}

abstract class AbstractWebAudioSource implements IBasicAudioSourceBackend {
    constructor(engine: BasicWebAudioEngine, options?: any) {
        //
    }
}

// TODO: Rename to `BasicWebAudioStaticSoundSource`, and others.
export class BasicWebAudioStaticSource extends AbstractWebAudioSource {
    _buffer: Nullable<AudioBuffer> = null;

    readonly onLoadObservable = new Observable<BasicWebAudioStaticSource>();

    get buffer(): Nullable<AudioBuffer> {
        return this._buffer;
    }

    get loaded(): boolean {
        return this._buffer !== null;
    }

    constructor(engine: BasicWebAudioEngine, options?: IBasicSoundSourceOptions) {
        super(engine, options);

        this._createBuffer(engine.audioContext, options);
    }

    private async _createBuffer(audioContext: AudioContext, options?: IBasicSoundSourceOptions): Promise<void> {
        if (options === undefined) {
            this._buffer = new AudioBuffer({ length: 1, sampleRate: audioContext.sampleRate });
            return Promise.resolve();
        }
        if (options.sourceUrl) {
            if (!(await this._createBufferFromUrl(audioContext, options.sourceUrl))) {
                Logger.Log(`Decoding audio data failed for URL: ${options.sourceUrl}` + "\n\tThe audio format may not be supported by this browser.");
            }
        } else if (options.sourceUrls) {
            if (!(await this._createBufferFromUrls(audioContext, options.sourceUrls))) {
                Logger.Log(`Decoding audio data failed for URLs: [ ${options.sourceUrls.join(", ")} ]` + "\n\tThe audio formats may not be supported by this browser.");
            }
        }
    }

    private async _createBufferFromUrl(audioContext: AudioContext, url: string): Promise<boolean> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        return new Promise<boolean>((resolve) => {
            audioContext
                .decodeAudioData(arrayBuffer)
                .then((buffer) => {
                    this._buffer = buffer;
                    this.onLoadObservable.notifyObservers(this);
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    }

    private async _createBufferFromUrls(audioContext: AudioContext, urls: string[]): Promise<boolean> {
        for (const url of urls) {
            if (await this._createBufferFromUrl(audioContext, url)) {
                return true;
            }
        }

        return false;
    }
}

export class BasicWebAudioStreamSource extends AbstractWebAudioSource {
    audioElement: HTMLAudioElement;

    constructor(engine: BasicWebAudioEngine, options?: any) {
        super(engine, options);
    }
}

export abstract class AbstractWebAudioVoice extends AbstractWebAudioGraphItem implements IBasicAudioVoiceBackend {
    abstract source: AbstractWebAudioSource;

    get inputNode(): Nullable<AudioNode> {
        return null;
    }

    constructor(engine: BasicWebAudioEngine, options?: IBasicCommonSoundOptions) {
        super(engine);
    }

    abstract start(): void;
    abstract stop(): void;
}

class StaticVoiceInstance implements IDispose {
    buffer: AudioBuffer;
    context: AudioContext;
    fadeTime: number = 0.1;
    gainNode: GainNode;
    sourceNode: Nullable<AudioBufferSourceNode>;
    state: AudioVoiceState = AudioVoiceState.Stopped;
    stopTimerId: Nullable<number> = null;

    constructor(audioContext: AudioContext) {
        this.gainNode = new GainNode(audioContext);
    }

    dispose(): void {
        this.gainNode.disconnect();
        this.sourceNode.removeEventListener("ended", this._onSourceNodeEnded);

        if (this.stopTimerId) {
            clearTimeout(this.stopTimerId);
        }
    }

    start(): void {
        if (this.state !== AudioVoiceState.Stopped) {
            return;
        }

        this._initSourceNode();
        this.sourceNode.start();
        this.state = AudioVoiceState.Started;
    }

    stop(): void {
        if (this.state !== AudioVoiceState.Started) {
            return;
        }

        const targetTime = this.engine.currentTime + this.fadeTime;
        this.sourceNode.stop(targetTime + 0.01);
        this.gainNode.gain.exponentialRampToValueAtTime(0, targetTime);
        this.setState(AudioVoiceState.Stopping);

        this.stopTimerId = setTimeout(() => {
            this.stopTimerId = null;
            this.state = AudioVoiceState.Stopped;
            this._disposeSourceNode();
        }, this.fadeTime * 1000);
    }

    private _initSourceNode(): void {
        if (this._sourceNode) {
            return;
        }

        this._sourceNode = new AudioBufferSourceNode(this.context, { buffer: this.buffer });
        this._sourceNode.connect(this.gainNode);
        this._sourceNode.addEventListener("ended", this._onSourceNodeEnded);
    }

    private _disposeSourceNode(): void {
        if (!this.sourceNode) {
            return;
        }

        this.sourceNode.stop();
        this.sourceNode.disconnect();
        this.sourceNode.removeEventListener("ended", this._onSourceNodeEnded);
        this.sourceNode = null;
    }

    private _onSourceNodeEnded(): void {
        this.state = AudioVoiceState.Stopped;
    }
}

export class BasicWebAudioStaticVoice extends AbstractWebAudioVoice implements IDisposable {
    _currentInstance: Nullable<StaticVoiceInstance>;
    _instances = new Array<StaticVoiceInstance>();
    _gainNode: GainNode;
    _state: AudioVoiceState = AudioVoiceState.Stopped;

    fadeTime: number = 0.1;
    source: BasicWebAudioStaticSource;

    onStateChangedObservable = new Observable<BasicWebAudioStaticVoice>();

    get outputNode(): Nullable<AudioNode> {
        return this._gainNode;
    }

    get started(): boolean {
        return this._state === AudioVoiceState.Started;
    }

    get stopped(): boolean {
        return this._state === AudioVoiceState.Stopped;
    }

    constructor(engine: BasicWebAudioEngine, options?: IBasicStaticSoundOptions) {
        super(engine, options);

        if (options?.source) {
            if (options.source instanceof BasicWebAudioStaticSource) {
                this.source = options.source;
            } else {
                throw new Error("Wrong source type.");
            }
        } else {
            this.source = new BasicWebAudioStaticSource(engine, options);
        }

        this._gainNode = new GainNode(this._getAudioContext());

        this.setMainOutputBus(this.engine.mainOutputBus);
    }

    dispose(): void {
        for (const instance of this._instances) {
            instance.dispose();
        }
        this._gainNode.disconnect();
    }

    setState(value: AudioVoiceState): void {
        if (this._state === value) {
            return;
        }

        this._state = value;
        this.onStateChangedObservable.notifyObservers(this);
    }

    start(): void {
        if (this.started || !this.source.buffer) {
            return;
        }

        console.log("BasicWebAudioStaticVoice.start ...");

        const instance = this._getNextInstance();
        instance.start();

        this.setState(AudioVoiceState.Started);
    }

    stop(): void {
        if (this.stopped) {
            return;
        }

        this._currentInstance?.stop();
        this.setState(AudioVoiceState.Stopped);

        console.log("BasicWebAudioStaticVoice.stop ...");
    }

    // TODO: Use a static instance pool for all classes.
    _getNextInstance(): StaticVoiceInstance {
        let instance = this._instances.find((i) => i.state === AudioVoiceState.Stopped);

        if (!instance) {
            instance = new StaticVoiceInstance(this._getAudioContext());
        }

        instance.buffer = this.source.buffer;
        instance.fadeTime = this.fadeTime;
        instance.gainNode.connect(this._gainNode);
        this._currentInstance = instance;
        this._instances.push(instance);

        return instance;
    }
}

export class BasicWebAudioStreamVoice extends AbstractWebAudioVoice {
    _sourceNode: MediaElementAudioSourceNode;
    _gainNode: GainNode;

    source: BasicWebAudioStreamSource;

    get outputNode(): Nullable<AudioNode> {
        return this._gainNode;
    }

    constructor(engine: BasicWebAudioEngine, options?: IBasicStreamSoundOptions) {
        super(engine, options);

        if (options?.source) {
            if (options.source instanceof BasicWebAudioStreamSource) {
                this.source = options.source;
            } else {
                throw new Error("Wrong source type.");
            }
        } else {
            this.source = new BasicWebAudioStreamSource(engine, options);
        }

        this._sourceNode = new MediaElementAudioSourceNode(this._getAudioContext(), { mediaElement: this.source.audioElement });
        this._gainNode = new GainNode(this._getAudioContext());

        this._sourceNode.connect(this._gainNode);
    }

    start(): void {}
    stop(): void {}
}
