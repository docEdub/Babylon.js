import type { Nullable } from "../../../types";
import type { AbstractAudioNode } from "../abstractAudioNode";
import type { AudioPositionerOptions } from "../audioPositioner";
import { AudioPositioner } from "../audioPositioner";
import type { SpatialAudioTransformOptions } from "../spatialAudioTransform";

/**
 * Options for creating a new WebAudioPositioner.
 */
export interface WebAudioPositionerOptions extends AudioPositionerOptions {}

/**
 * Creates a new audio positioner.
 * @param parent - The parent node.
 * @param options - The options for creating the positioner.
 * @returns A promise that resolves with the created positioner.
 */
export async function CreateAudioPositionerAsync(parent: AbstractAudioNode, options: Nullable<WebAudioPositionerOptions> = null): Promise<AudioPositioner> {
    return new WebAudioPositioner(parent, options);
}

class WebAudioPositioner extends AudioPositioner {
    /** @internal */
    constructor(parent: AbstractAudioNode, options: Nullable<SpatialAudioTransformOptions> = null) {
        super(parent, options);
    }
}
