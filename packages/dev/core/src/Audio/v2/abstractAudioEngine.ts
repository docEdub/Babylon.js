/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioDevice } from "./abstractAudioDevice";
import type { AbstractAudioListener } from "./abstractAudioListener";
import type { AbstractAudioNode } from "./abstractAudioNode";
import { AbstractAudioNodeParent } from "./abstractAudioNodeParent";
import type { AbstractAudioPositioner } from "./abstractAudioPositioner";
import type { AbstractAudioSender } from "./abstractAudioSender";
import type { AbstractMainAudioBus } from "./abstractMainAudioBus";
import type { AbstractSoundSource } from "./abstractSoundSource";
import type { AbstractStaticSoundInstance } from "./abstractStaticSoundInstance";
import type { AbstractStaticSoundSource } from "./abstractStaticSoundSource";
import type { AbstractStreamingSoundInstance } from "./abstractStreamingSoundInstance";
import type { AbstractStreamingSoundSource } from "./abstractStreamingSoundSource";

/**
 * Owns top-level AbstractAudioNode objects.
 * Owns all AbstractSoundSource objects.
 */
export abstract class AbstractAudioEngine extends AbstractAudioNodeParent {
    public override dispose(): void {
        this._soundInstances.length = 0;

        for (const source of this._soundSources) {
            source.dispose();
        }
        this._soundSources.clear();

        super.dispose();
    }

    // NB: Does not indicate ownership, but all its items should be in the child nodes array, too, which does indicate
    // ownership.
    // TODO: Figure out if a Set would be better here. It would be more efficient for lookups, but we need to be able
    // to sort sound instance by priority as fast as possible when the advanced audio engine is implemented. Is an
    // array faster in that case?
    private _soundInstances = new Array<AbstractStaticSoundInstance>();

    public _addSoundInstance(instance: AbstractStaticSoundInstance): void {
        if (this._soundInstances.includes(instance)) {
            return;
        }

        this._soundInstances.push(instance);
    }

    public _removeSoundInstance(instance: AbstractStaticSoundInstance): void {
        const index = this._soundInstances.indexOf(instance);
        if (index < 0) {
            return;
        }

        this._soundInstances.splice(index, 1);
    }

    private _soundSources = new Set<AbstractSoundSource>();

    public _addSoundSource(soundSource: AbstractSoundSource): void {
        this._soundSources.add(soundSource);
    }

    public _removeSoundSource(soundSource: AbstractSoundSource): void {
        this._soundSources.delete(soundSource);
    }

    public abstract createDevice(name: string): AbstractAudioDevice;
    public abstract createListener(parent: AbstractAudioDevice): AbstractAudioListener;
    public abstract createMainBus(name: string): AbstractMainAudioBus;
    public abstract createPositioner(parent: AbstractAudioNode): AbstractAudioPositioner;
    public abstract createSender(parent: AbstractAudioNode): AbstractAudioSender;
    public abstract createStaticSoundInstance(source: AbstractStaticSoundSource, inputNode: AbstractAudioNode): AbstractStaticSoundInstance;
    public abstract createStreamingSoundInstance(source: AbstractStreamingSoundSource, inputNode: AbstractAudioNode): AbstractStreamingSoundInstance;
}
