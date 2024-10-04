/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import { AbstractAudioNodeParent } from "./abstractAudioNodeParent";
import type { AbstractSoundSource } from "./abstractSoundSource";
import type { AbstractStaticSoundInstance } from "./abstractStaticSoundInstance";
import type { SpatialAudioListener } from "./spatialAudioListener";

/**
 * Owns top-level AbstractAudioNode objects.
 * Owns all AbstractSoundSource objects.
 */
export abstract class AbstractAudioEngine extends AbstractAudioNodeParent {
    // Owned
    private _listeners = new Set<SpatialAudioListener>();

    // Not owned, but all items should in parent's `children` container, too, which is owned.
    private _soundInstances = new Set<AbstractStaticSoundInstance>();

    // Owned
    private _soundSources = new Set<AbstractSoundSource>();

    public override dispose(): void {
        super.dispose();

        this._soundInstances.clear();

        if (this._listeners) {
            for (const listener of this._listeners) {
                listener.dispose();
            }
            this._listeners.clear();
        }

        for (const source of this._soundSources) {
            source.dispose();
        }
        this._soundSources.clear();
    }

    public override internal() {
        return new (class extends super.internal().internalClass {
            public engine: AbstractAudioEngine;

            public constructor(engine: AbstractAudioEngine) {
                super(engine);

                this.engine = engine;
            }

            public get listeners(): Set<SpatialAudioListener> {
                return this.engine._listeners;
            }

            public get soundInstances(): Set<AbstractStaticSoundInstance> {
                return this.engine._soundInstances;
            }

            public get soundSources(): Set<AbstractSoundSource> {
                return this.engine._soundSources;
            }
        })(this);
    }
}
