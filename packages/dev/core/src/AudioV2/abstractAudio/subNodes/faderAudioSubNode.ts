import type { Nullable } from "../../../types";
import type { AudioParameterCurveShape } from "../../audioParameter";
import type { AudioEngineV2 } from "../audioEngineV2";
import type { _AbstractAudioSubGraph } from "./abstractAudioSubGraph";
import { _AbstractAudioSubNode } from "./abstractAudioSubNode";
import { AudioSubNode } from "./audioSubNode";

/** @internal */
export abstract class _FaderAudioSubNode extends _AbstractAudioSubNode {
    protected constructor(engine: AudioEngineV2) {
        super(AudioSubNode.FADER, engine);
    }

    public abstract cancelFade(): void;
    public abstract fadeIn(duration: number, curve: AudioParameterCurveShape): void;
    public abstract fadeOut(duration: number, curve: AudioParameterCurveShape): void;
}

/** @internal */
export function _GetFaderAudioSubNode(subGraph: _AbstractAudioSubGraph): Nullable<_FaderAudioSubNode> {
    return subGraph.getSubNode<_FaderAudioSubNode>(AudioSubNode.FADER);
}
