import type { Nullable } from "../../../types";
import { StreamingSound } from "../streamingSound";
import { StreamingSoundInstance } from "../streamingSoundInstance";
import type { WebAudioEngine, WebAudioStreamingSoundOptions } from "./webAudioEngine";

/**
 *
 * @param source
 * @returns
 */
export function CreateStreamingSoundInstance(source: WebAudioStreamingSound): StreamingSoundInstance {
    const soundInstance = new WebAudioStreamingSoundInstance(source);
    source.engine.addSoundInstance(soundInstance);
    return soundInstance;
}

/** @internal */
export class WebAudioStreamingSound extends StreamingSound {
    private _gainNode: GainNode;

    /** @internal */
    public override readonly engine: WebAudioEngine;

    /** @internal */
    public audioContext: BaseAudioContext;

    /** @internal */
    public get volume(): number {
        return this._gainNode.gain.value;
    }

    public set volume(value: number) {
        this._gainNode.gain.value = value;
    }

    /** @internal */
    public get currentTime(): number {
        return 0;
    }

    /** @internal */
    constructor(name: string, engine: WebAudioEngine, options: Nullable<WebAudioStreamingSoundOptions> = null) {
        super(name, engine, options);
    }

    /** @internal */
    public async init(options: Nullable<WebAudioStreamingSoundOptions> = null): Promise<void> {
        this.audioContext = await this.engine.audioContext;

        this._gainNode = new GainNode(this.audioContext);

        this.volume = options?.volume ?? 1;
    }

    protected _createSoundInstance(): WebAudioStreamingSoundInstance {
        return CreateStreamingSoundInstance(this) as WebAudioStreamingSoundInstance;
    }
}

/** @internal */
export class WebAudioStreamingSoundInstance extends StreamingSoundInstance {
    public get currentTime(): number {
        return 0;
    }

    constructor(source: WebAudioStreamingSound) {
        super(source);
    }

    public async init(): Promise<void> {}

    /** @internal */
    public play(waitTime: Nullable<number> = null, startOffset: Nullable<number> = null, duration: Nullable<number> = null): void {}

    /** @internal */
    public pause(): void {}

    /** @internal */
    public resume(): void {}

    /** @internal */
    public override stop(waitTime: Nullable<number> = null): void {}
}
