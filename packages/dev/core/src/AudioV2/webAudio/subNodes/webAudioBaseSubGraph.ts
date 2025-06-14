import type { Nullable } from "../../../types";
import type { AbstractAudioNode } from "../../abstractAudio/abstractAudioNode";
import { _AbstractAudioSubGraph } from "../../abstractAudio/subNodes/abstractAudioSubGraph";
import type { _AbstractAudioSubNode } from "../../abstractAudio/subNodes/abstractAudioSubNode";
import { _GetAudioAnalyzerSubNode } from "../../abstractAudio/subNodes/audioAnalyzerSubNode";
import { AudioSubNode } from "../../abstractAudio/subNodes/audioSubNode";
import { _GetFaderAudioSubNode, type _FaderAudioSubNode } from "../../abstractAudio/subNodes/faderAudioSubNode";
import type { IVolumeAudioOptions } from "../../abstractAudio/subNodes/volumeAudioSubNode";
import { _GetVolumeAudioSubNode } from "../../abstractAudio/subNodes/volumeAudioSubNode";
import type { IAudioAnalyzerOptions } from "../../abstractAudio/subProperties/abstractAudioAnalyzer";
import { _HasAudioAnalyzerOptions } from "../../abstractAudio/subProperties/abstractAudioAnalyzer";
import type { AudioParameterCurveShape } from "../../audioParameter";
import type { IWebAudioInNode, IWebAudioSuperNode } from "../webAudioNode";
import { _CreateFaderAudioSubNodeAsync } from "./faderWebAudioSubNode";
import type { _VolumeWebAudioSubNode } from "./volumeWebAudioSubNode";
import { _CreateVolumeAudioSubNodeAsync } from "./volumeWebAudioSubNode";
import { _CreateAudioAnalyzerSubNodeAsync } from "./webAudioAnalyzerSubNode";

/**
 * Options for creating a WebAudioBaseSubGraph.
 */
export interface IWebAudioBaseSubGraphOptions extends IAudioAnalyzerOptions, IVolumeAudioOptions {}

/** @internal */
export abstract class _WebAudioBaseSubGraph extends _AbstractAudioSubGraph {
    private _outputNode: Nullable<AudioNode> = null;

    protected _inputNode: Nullable<AudioNode> = null;
    protected _owner: IWebAudioSuperNode;

    /** @internal */
    public constructor(owner: IWebAudioSuperNode) {
        super();

        this._owner = owner;
    }

    /** @internal */
    public async initAsync(options: Partial<IWebAudioBaseSubGraphOptions>): Promise<void> {
        const hasAnalyzerOptions = _HasAudioAnalyzerOptions(options);

        if (hasAnalyzerOptions) {
            await this.createAndAddSubNodeAsync(AudioSubNode.ANALYZER);
        }

        await this.createAndAddSubNodeAsync(AudioSubNode.VOLUME);

        await this._createSubNodePromisesResolvedAsync();

        if (hasAnalyzerOptions) {
            const analyzerNode = _GetAudioAnalyzerSubNode(this);
            if (!analyzerNode) {
                throw new Error("No analyzer subnode.");
            }

            analyzerNode.setOptions(options);
        }

        const volumeNode = _GetVolumeAudioSubNode(this);
        if (!volumeNode) {
            throw new Error("No volume subnode.");
        }

        volumeNode.setOptions(options);

        if (volumeNode.getClassName() !== "_VolumeWebAudioSubNode") {
            throw new Error("Not a WebAudio subnode.");
        }

        this._inputNode = (volumeNode as _VolumeWebAudioSubNode)._inNode;
        this._outputNode = (volumeNode as _VolumeWebAudioSubNode)._outNode;

        // Connect the new wrapped WebAudio node to the wrapped downstream WebAudio nodes.
        // The wrapper nodes are unaware of this change.
        if (this._outputNode && this._downstreamNodes) {
            const it = this._downstreamNodes.values();
            for (let next = it.next(); !next.done; next = it.next()) {
                const inNode = (next.value as IWebAudioInNode)._inNode;
                if (inNode) {
                    this._outputNode.connect(inNode);
                }
            }
        }
    }

    protected abstract readonly _downstreamNodes: Nullable<Set<AbstractAudioNode>>;

    /** @internal */
    public get volume(): number {
        const volumeNode = _GetVolumeAudioSubNode(this);
        if (!volumeNode) {
            throw new Error("No volume subnode.");
        }

        const faderNode = _GetFaderAudioSubNode(this);
        if (faderNode) {
            return faderNode.volume * volumeNode.volume;
        }

        return volumeNode.volume;
    }

    /** @internal */
    public set volume(value: number) {
        _GetFaderAudioSubNode(this)?.cancelFade();

        const volumeNode = _GetVolumeAudioSubNode(this);
        if (!volumeNode) {
            throw new Error("No volume subnode.");
        }

        volumeNode.volume = value;
    }

    /** @internal */
    public get _inNode(): Nullable<AudioNode> {
        return this._inputNode;
    }

    /** @internal */
    public get _outNode(): Nullable<AudioNode> {
        return this._outputNode;
    }

    /** @internal */
    public cancelFade(): void {
        const faderNode = _GetFaderAudioSubNode(this);
        if (faderNode) {
            faderNode.cancelFade();
        }
    }

    /** @internal */
    public async fadeInAsync(duration: number, curve: AudioParameterCurveShape): Promise<void> {
        const faderNode = await this._getFaderSubNodeAsync();
        faderNode.fadeIn(duration, curve);
    }

    /** @internal */
    public async fadeOutAsync(duration: number, curve: AudioParameterCurveShape): Promise<void> {
        const faderNode = await this._getFaderSubNodeAsync();
        faderNode.fadeOut(duration, curve);
    }

    // Function is async, but throws synchronously. Avoiding breaking changes.
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    protected _createSubNode(name: string): Promise<_AbstractAudioSubNode> {
        switch (name) {
            case AudioSubNode.ANALYZER:
                return _CreateAudioAnalyzerSubNodeAsync(this._owner.engine);
            case AudioSubNode.FADER:
                return _CreateFaderAudioSubNodeAsync(this._owner.engine);
            case AudioSubNode.VOLUME:
                return _CreateVolumeAudioSubNodeAsync(this._owner.engine);
            default:
                throw new Error(`Unknown subnode name: ${name}`);
        }
    }

    protected _onSubNodesChanged(): void {
        const analyzerNode = _GetAudioAnalyzerSubNode(this);
        const faderNode = _GetFaderAudioSubNode(this);
        const volumeNode = _GetVolumeAudioSubNode(this);

        analyzerNode?.disconnectAll();

        if (analyzerNode) {
            analyzerNode.disconnectAll();

            if (faderNode) {
                analyzerNode.connect(faderNode);
            } else if (volumeNode) {
                analyzerNode.connect(volumeNode);
            }
        }

        if (faderNode) {
            faderNode.disconnectAll();

            if (volumeNode) {
                faderNode.connect(volumeNode);
            }
        }
    }

    private async _getFaderSubNodeAsync(): Promise<_FaderAudioSubNode> {
        let faderNode = _GetFaderAudioSubNode(this);

        if (!faderNode) {
            await this.createAndAddSubNodeAsync(AudioSubNode.FADER);
            faderNode = _GetFaderAudioSubNode(this);
        }

        if (!faderNode) {
            throw new Error("No fader subnode.");
        }

        return faderNode;
    }
}
