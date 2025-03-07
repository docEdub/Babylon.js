import type { _AudioAnalyzerSubNode } from "../../abstractAudio/subNodes/audioAnalyzerSubNode";
import type { _SpatialAudioSubNode } from "../../abstractAudio/subNodes/spatialAudioSubNode";
import type { _StereoAudioSubNode } from "../../abstractAudio/subNodes/stereoAudioSubNode";
import type { _WebAudioEngine } from "../webAudioEngine";

/** @internal */
export async function _CreateAudioAnalyzerSubNodeAsync(engine: _WebAudioEngine): Promise<_AudioAnalyzerSubNode> {
    const module = await import("./webAudioAnalyzerSubNode");
    return new module._WebAudioAnalyzerSubNode(engine);
}

/** @internal */
export async function _CreateSpatialAudioSubNodeAsync(engine: _WebAudioEngine): Promise<_SpatialAudioSubNode> {
    const module = await import("./spatialWebAudioSubNode");
    return new module._SpatialWebAudioSubNode(engine);
}

/** @internal */
export async function _CreateStereoAudioSubNodeAsync(engine: _WebAudioEngine): Promise<_StereoAudioSubNode> {
    const module = await import("./stereoWebAudioSubNode");
    return new module._StereoWebAudioSubNode(engine);
}
