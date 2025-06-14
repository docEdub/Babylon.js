import type { Nullable } from "../../types";
import { AudioParameterCurveShape } from "../audioParameter";
import type { AudioNodeType } from "./abstractAudioNode";
import { AbstractNamedAudioNode } from "./abstractAudioNode";
import type { AudioEngineV2 } from "./audioEngineV2";
import type { _AbstractAudioSubGraph } from "./subNodes/abstractAudioSubGraph";
import type { IVolumeAudioOptions } from "./subNodes/volumeAudioSubNode";
import type { AbstractAudioAnalyzer, IAudioAnalyzerOptions } from "./subProperties/abstractAudioAnalyzer";
import { _AudioAnalyzer } from "./subProperties/audioAnalyzer";

/** @internal */
export interface IAbstractAudioOutNodeOptions extends IAudioAnalyzerOptions, IVolumeAudioOptions {}

/**
 * Abstract class representing and audio output node with volume control.
 */
export abstract class AbstractAudioOutNode extends AbstractNamedAudioNode {
    private _analyzer: Nullable<AbstractAudioAnalyzer> = null;

    protected abstract _subGraph: _AbstractAudioSubGraph;

    protected constructor(name: string, engine: AudioEngineV2, nodeType: AudioNodeType) {
        super(name, engine, nodeType);
    }

    /**
     * The analyzer features of the bus.
     */
    public get analyzer(): AbstractAudioAnalyzer {
        return this._analyzer ?? (this._analyzer = new _AudioAnalyzer(this._subGraph));
    }

    /**
     * The audio output volume.
     */
    public get volume(): number {
        return this._subGraph.volume;
    }

    public set volume(value: number) {
        this._subGraph.volume = value;
    }

    /**
     * Releases associated resources.
     */
    public override dispose(): void {
        super.dispose();

        this._analyzer?.dispose();
        this._analyzer = null;

        this._subGraph.dispose();
    }

    /**
     * Cancels any ongoing fade operation.
     */
    public cancelFade(): void {
        this._subGraph.volume = this.volume;
    }

    /**
     * Fades in the audio output volume.
     * @param duration the time in seconds to fade in the audio.
     * @param curve the curve shape to use for the fade. Defaults to linear.
     */
    public fadeIn(duration: number, curve: AudioParameterCurveShape = AudioParameterCurveShape.LINEAR): void {
        this.cancelFade();
        void this._subGraph.fadeInAsync(duration, curve);
    }

    /**
     * Fades out the audio output volume.
     * @param duration the time in seconds to fade out the audio.
     * @param curve the curve shape to use for the fade. Defaults to linear.
     */
    public fadeOut(duration: number, curve: AudioParameterCurveShape = AudioParameterCurveShape.LINEAR): void {
        this.cancelFade();
        void this._subGraph.fadeOutAsync(duration, curve);
    }
}
