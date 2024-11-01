import type { Nullable } from "../../../types";
import { AbstractAudioEngine } from "../abstractAudioEngine";
import type { AbstractAudioNode } from "../abstractAudioNode";
import type { AbstractSound } from "../abstractSound";
import type { AbstractSoundInstance } from "../abstractSoundInstance";
import type { AudioBusOptions } from "../audioBus";
import type { AudioSender } from "../audioSender";
import type { MainAudioBus } from "../mainAudioBus";
import type { MainAudioOutput } from "../mainAudioOutput";
import { WebAudioMainBus } from "./webAudioMainBus";
import { WebAudioMainOutput } from "./webAudioMainOutput";
import { WebAudioSender } from "./webAudioSender";

/**
 * Options for creating a new WebAudioBus.
 */
export interface WebAudioBusOptions extends AudioBusOptions {}

/**
 * Options for creating a new WebAudioEngine.
 */
export interface WebAudioEngineOptions {
    /**
     * The audio context to be used by the engine.
     */
    audioContext?: BaseAudioContext;
}

/**
 * Creates a new main audio bus.
 * @param name - The name of the main bus.
 * @param engine - The audio engine.
 * @returns A promise that resolves with the created main audio bus.
 */
export async function CreateMainAudioBusAsync(name: string, engine: WebAudioEngine): Promise<MainAudioBus> {
    const bus = new WebAudioMainBus(name, engine);
    await bus.init();
    engine.addMainBus(bus);
    return bus;
}

/**
 * Creates a new main audio output.
 * @param engine - The audio engine.
 * @returns A promise that resolves with the created audio output.
 */
export async function CreateMainAudioOutputAsync(engine: WebAudioEngine): Promise<MainAudioOutput> {
    const mainAudioOutput = new WebAudioMainOutput(engine);
    await mainAudioOutput.init();
    return mainAudioOutput;
}

/**
 * Creates a new WebAudioSender.
 * @param parent - The parent audio node.
 * @returns A promise that resolves to the created WebAudioSender.
 */
export async function CreateAudioSenderAsync(parent: AbstractAudioNode): Promise<AudioSender> {
    return new WebAudioSender(parent);
}

/**
 * Creates a new WebAudioEngine.
 * @param options - The options for creating the audio engine.
 * @returns A promise that resolves with the created audio engine.
 */
export async function CreateAudioEngineAsync(options: Nullable<WebAudioEngineOptions> = null): Promise<AbstractAudioEngine> {
    const engine = new WebAudioEngine();
    await engine.init(options);
    return engine;
}

const formatMimeTypeMap = new Map<string, string>([
    ["aac", "audio/aac"],
    ["ac3", "audio/ac3"],
    ["flac", "audio/flac"],
    ["m4a", "audio/mp4"],
    ["mp3", 'audio/mpeg; codecs="mp3"'],
    ["mp4", "audio/mp4"],
    ["ogg", 'audio/ogg; codecs="vorbis"'],
    ["wav", "audio/wav"],
    ["webm", 'audio/webm; codecs="vorbis"'],
]);

/** @internal */
export class WebAudioEngine extends AbstractAudioEngine {
    private _audioContext: BaseAudioContext;
    private _mainOutput: Nullable<WebAudioMainOutput> = null;

    private _invalidFormats = new Set<string>();
    private _validFormats = new Set<string>();

    /** @internal */
    public get currentTime(): number {
        return this._audioContext.currentTime;
    }

    /** @internal */
    public get mainOutput(): Nullable<WebAudioMainOutput> {
        return this._mainOutput;
    }

    private async _initAudioContext(): Promise<void> {
        if (this._audioContext === undefined) {
            this._audioContext = new BaseAudioContext();
        }

        if (this._audioContext instanceof AudioContext) {
            await this._audioContext.resume();
        }

        this._resolveAudioContext(this._audioContext);

        document.removeEventListener("click", this._initAudioContext);
    }

    private _resolveAudioContext: (audioContext: BaseAudioContext) => void;

    /** @internal */
    public audioContext = new Promise<BaseAudioContext>((resolve) => {
        this._resolveAudioContext = resolve;
        document.addEventListener("click", this._initAudioContext.bind(this), { once: true });
    });

    /** @internal */
    public get webAudioInputNode(): AudioNode {
        return this._audioContext.destination;
    }

    /** @internal */
    public async init(options: Nullable<WebAudioEngineOptions> = null): Promise<void> {
        if (options?.audioContext) {
            this._audioContext = options.audioContext;
            this._initAudioContext();
        }

        this._mainOutput = (await CreateMainAudioOutputAsync(this)) as WebAudioMainOutput;

        await CreateMainAudioBusAsync("default", this);
    }

    /** @internal */
    public flagInvalidFormat(format: string): void {
        this._invalidFormats.add(format);
    }

    /** @internal */
    public formatIsValid(format: string): boolean {
        if (this._validFormats.has(format)) {
            return true;
        }

        if (this._invalidFormats.has(format)) {
            return false;
        }

        const mimeType = formatMimeTypeMap.get(format);
        if (mimeType === undefined) {
            return false;
        }

        const audio = new Audio();
        if (audio.canPlayType(mimeType) === "") {
            this._invalidFormats.add(format);
            return false;
        }

        this._validFormats.add(format);

        return true;
    }

    /** @internal */
    public addMainBus(mainBus: MainAudioBus): void {
        this._addMainBus(mainBus);
    }

    /** @internal */
    public addSound(sound: AbstractSound): void {
        this._addSound(sound);
    }

    /** @internal */
    public addSoundInstance(soundInstance: AbstractSoundInstance): void {
        this._addSoundInstance(soundInstance);
    }
}
