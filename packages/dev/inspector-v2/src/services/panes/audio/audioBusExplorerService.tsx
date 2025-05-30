// eslint-disable-next-line import/no-internal-modules
import { AbstractAudioBus, AllAudioEngines, AudioEngineV2, MainAudioBus, type Observer } from "core/index";

import type { ServiceDefinition } from "../../../modularity/serviceDefinition";
import type { IAudioExplorerService } from "./audioExplorerService";

import { ArrowEnterUpRegular, HeadphonesSoundWaveRegular } from "@fluentui/react-icons";

import { AudioBus } from "core/AudioV2/abstractAudio/audioBus";

import { AudioExplorerServiceIdentity } from "./audioExplorerService";

type EntityBase = Readonly<{
    name: string;
    uniqueId: number;
}>;

export const AudioBusExplorerServiceDefinition: ServiceDefinition<[], [IAudioExplorerService]> = {
    friendlyName: "Buses",
    consumes: [AudioExplorerServiceIdentity],
    factory: (audioExplorerService) => {
        const sectionRegistration = audioExplorerService.addSection({
            displayName: "Buses",
            order: 2,
            getRootEntities: (audioEngines) =>
                audioEngines.length > 1
                    ? audioEngines
                    : (audioEngines
                          .flatMap((audioEngine) => Array.from(audioEngine.buses))
                          .filter((b) => b instanceof MainAudioBus || (b instanceof AudioBus && !b.outBus)) as EntityBase[]),
            getEntityChildren: (entity) =>
                AllAudioEngines().flatMap((audioEngine) =>
                    Array.from(audioEngine.buses).filter((b) => (b instanceof AudioBus && b.outBus === entity) || (b instanceof MainAudioBus && b.engine === entity))
                ),
            getEntityDisplayName: (entity) => entity.name,
            getEntityParent: (entity) => (entity instanceof AudioBus ? entity.outBus! : (entity as MainAudioBus).engine),
            isChild: (entity) => entity instanceof AbstractAudioBus,
            entityIcon: ({ entity: node }) => (node instanceof AudioEngineV2 ? <HeadphonesSoundWaveRegular /> : node instanceof AbstractAudioBus ? <ArrowEnterUpRegular /> : <></>),
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
