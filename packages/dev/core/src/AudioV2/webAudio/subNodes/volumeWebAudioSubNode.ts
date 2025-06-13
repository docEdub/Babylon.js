import type { Nullable } from "../../../types";
import { _VolumeAudioSubNode } from "../../abstractAudio/subNodes/volumeAudioSubNode";
import type { AudioParameterRampShape } from "../../audioParameter";
import type { _WebAudioEngine } from "../webAudioEngine";
import type { IWebAudioInNode, IWebAudioSubNode } from "../webAudioNode";

/** @internal */
// eslint-disable-next-line @typescript-eslint/require-await
export async function _CreateVolumeAudioSubNodeAsync(engine: _WebAudioEngine): Promise<_VolumeAudioSubNode> {
    return new _VolumeWebAudioSubNode(engine);
}

/** @internal */
export class _VolumeWebAudioSubNode extends _VolumeAudioSubNode implements IWebAudioSubNode {
    private _fadeNode: Nullable<GainNode> = null;
    private _volume: number = 1;
    private readonly _volumeNode: GainNode;

    /** @internal */
    public override readonly engine: _WebAudioEngine;

    /** @internal */
    public constructor(engine: _WebAudioEngine) {
        super(engine);

        this._volumeNode = new GainNode(engine._audioContext);
    }

    /** @internal */
    public get volume(): number {
        return this._volume;
    }

    /** @internal */
    public set volume(value: number) {
        this._volume = value;
        this.engine._setAudioParam(this._volumeNode.gain, value);
    }

    /** @internal */
    public get _inNode(): AudioNode {
        return this._volumeNode;
    }

    /** @internal */
    public get _outNode(): AudioNode {
        return this._fadeNode ?? this._volumeNode;
    }

    /** @internal */
    public fadeIn(duration: number, rampShape: AudioParameterRampShape): void {
        this._initFadeNode();

        const fadeNode = this._fadeNode!;

        fadeNode.gain.value = 0;

        fadeNode.gain.cancelScheduledValues(0);
        fadeNode.gain.setValueCurveAtTime([0, 1], 0, duration);
    }

    /** @internal */
    public fadeOut(duration: number, rampShape: AudioParameterRampShape): void {
        this._initFadeNode();

        const fadeNode = this._fadeNode!;

        fadeNode.gain.value = 0;

        fadeNode.gain.cancelScheduledValues(0);
        fadeNode.gain.setValueCurveAtTime([1, 0], 0, duration);
    }

    /** @internal */
    public getClassName(): string {
        return "_VolumeWebAudioSubNode";
    }

    protected override _connect(node: IWebAudioInNode): boolean {
        const connected = super._connect(node);

        if (!connected) {
            return false;
        }

        // If the wrapped node is not available now, it will be connected later by the subgraph.
        if (node._inNode) {
            this._volumeNode.connect(node._inNode);
        }

        return true;
    }

    protected override _disconnect(node: IWebAudioInNode): boolean {
        const disconnected = super._disconnect(node);

        if (!disconnected) {
            return false;
        }

        if (node._inNode) {
            this._volumeNode.disconnect(node._inNode);
        }

        return true;
    }

    private _initFadeNode(): void {
        if (this._fadeNode) {
            return;
        }

        this._fadeNode = new GainNode(this.engine._audioContext);
        this._volumeNode.connect(this._fadeNode);

        if (this._downstreamNodes) {
            const it = this._downstreamNodes.values();
            for (let next = it.next(); !next.done; next = it.next()) {
                const inNode = (next.value as IWebAudioInNode)._inNode;
                if (inNode) {
                    this._volumeNode.disconnect(inNode);
                    this._fadeNode.connect(inNode);
                }
            }
        }
    }
}
