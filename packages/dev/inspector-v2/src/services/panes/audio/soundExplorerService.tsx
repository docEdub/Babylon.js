// eslint-disable-next-line import/no-internal-modules
import { _WebAudioSoundSource, AbstractAudioBus, AudioEngineV2, MainAudioBus, StaticSound, StreamingSound, type Observer } from "core/index";

import type { ServiceDefinition } from "../../../modularity/serviceDefinition";
import type { IAudioExplorerService } from "./audioExplorerService";

import { ArrowEnterUpRegular, CatchUpRegular, HeadphonesSoundWaveRegular, MicRegular, SoundWaveCircleFilled, SoundWaveCircleRegular } from "@fluentui/react-icons";

import { AudioBus } from "core/AudioV2/abstractAudio/audioBus";

import { AudioExplorerServiceIdentity } from "./audioExplorerService";
import { AbstractSoundSource } from "core/AudioV2/abstractAudio/abstractSoundSource";

type EntityBase = Readonly<{
    name: string;
    uniqueId: number;
}>;

export const SoundExplorerServiceDefinition: ServiceDefinition<[], [IAudioExplorerService]> = {
    friendlyName: "Sounds",
    consumes: [AudioExplorerServiceIdentity],
    factory: (audioExplorerService) => {
        const sectionRegistration = audioExplorerService.addSection({
            displayName: "Sounds",
            order: 2,
            getRootEntities: (audioEngines) => audioEngines as EntityBase[],
            getEntityChildren: (entity) => {
                if (entity instanceof AudioEngineV2) {
                    return Array.from(entity.buses).filter((bus) => bus instanceof MainAudioBus && bus.engine === entity);
                } else if (entity instanceof AbstractAudioBus) {
                    const children: EntityBase[] = Array.from(entity.engine.buses).filter((bus) => bus instanceof AudioBus && bus.outBus === entity);
                    children.push(...Array.from(entity.engine.sounds).filter((sound) => sound.outBus === entity));
                    return children;
                }
                return [];
            },
            getEntityDisplayName: (entity) => entity.name,
            getEntityParent: (entity) => (entity instanceof MainAudioBus ? entity.engine! : (entity as AudioBus).outBus!),
            isChild: (entity) => entity instanceof MainAudioBus || ((entity instanceof AudioBus || entity instanceof AbstractSoundSource) && entity.outBus !== null),
            entityIcon: ({ entity: node }) =>
                node instanceof AudioEngineV2 ? (
                    <HeadphonesSoundWaveRegular />
                ) : node instanceof AbstractAudioBus ? (
                    <ArrowEnterUpRegular />
                ) : node instanceof StaticSound ? (
                    <SoundWaveCircleRegular />
                ) : node instanceof StreamingSound ? (
                    <SoundWaveCircleFilled />
                ) : node instanceof _WebAudioSoundSource && node._webAudioNode instanceof MediaStreamAudioSourceNode ? (
                    <MicRegular />
                ) : node instanceof _WebAudioSoundSource ? (
                    <CatchUpRegular />
                ) : (
                    <></>
                ),
            watch: (audioEngines, onAdded, onRemoved) => {
                const observers: Observer<any>[] = [];

                // observers.push(
                //     scene.onNewMaterialAddedObservable.add((material) => {
                //         onAdded(material);
                //     })
                // );

                // observers.push(
                //     scene.onMaterialRemovedObservable.add((material) => {
                //         onRemoved(material);
                //     })
                // );

                return {
                    dispose: () => {
                        for (const observer of observers) {
                            observer.remove();
                        }
                    },
                };
            },
        });

        return {
            dispose: () => {
                sectionRegistration.dispose();
            },
        };
    },
};
