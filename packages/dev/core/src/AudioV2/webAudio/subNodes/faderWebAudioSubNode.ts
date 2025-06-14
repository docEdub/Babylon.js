import { _FaderAudioSubNode } from "../../abstractAudio/subNodes/faderAudioSubNode";
import type { AudioParameterCurveShape } from "../../audioParameter";
import type { _WebAudioEngine } from "../webAudioEngine";
import type { IWebAudioInNode, IWebAudioSubNode } from "../webAudioNode";

/** @internal */
export async function _CreateFaderAudioSubNodeAsync(engine: _WebAudioEngine): Promise<_FaderAudioSubNode> {
    return new _FaderWebAudioSubNode(engine);
}

/** @internal */
export class _FaderWebAudioSubNode extends _FaderAudioSubNode implements IWebAudioSubNode {
    /** @internal */
    public override readonly engine: _WebAudioEngine;

    /** @internal */
    public readonly node: GainNode;

    /** @internal */
    public constructor(engine: _WebAudioEngine) {
        super(engine);

        this.node = new GainNode(engine._audioContext);
    }

    /** @internal */
    public get volume(): number {
        return this.node.gain.value;
    }

    /** @internal */
    public get _inNode(): AudioNode {
        return this.node;
    }

    /** @internal */
    public get _outNode(): AudioNode {
        return this.node;
    }

    /** @internal */
    public cancelFade(): void {
        this.node.gain.cancelScheduledValues(0);
        this.node.gain.value = 1;
    }

    /** @internal */
    public fadeIn(duration: number, curve: AudioParameterCurveShape): void {
        this.cancelFade();
        this.node.gain.setValueCurveAtTime([0, 1], this.engine.currentTime, duration);
    }

    /** @internal */
    public fadeOut(duration: number, curve: AudioParameterCurveShape): void {
        this.cancelFade();
        this.node.gain.setValueCurveAtTime([1, 0], this.engine.currentTime, duration);
    }

    /** @internal */
    public getClassName(): string {
        return "_FaderWebAudioSubNode";
    }

    protected override _connect(node: IWebAudioInNode): boolean {
        const connected = super._connect(node);

        if (!connected) {
            return false;
        }

        // If the wrapped node is not available now, it will be connected later by the subgraph.
        if (node._inNode) {
            this.node.connect(node._inNode);
        }

        return true;
    }

    protected override _disconnect(node: IWebAudioInNode): boolean {
        const disconnected = super._disconnect(node);

        if (!disconnected) {
            return false;
        }

        if (node._inNode) {
            this.node.disconnect(node._inNode);
        }

        return true;
    }
}
