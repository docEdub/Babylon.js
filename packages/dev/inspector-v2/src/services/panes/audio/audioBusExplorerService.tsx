// eslint-disable-next-line import/no-internal-modules
import { AllAudioEngines, MainAudioBus, type Observer } from "core/index";

import type { ServiceDefinition } from "../../../modularity/serviceDefinition";
import type { IAudioExplorerService } from "./audioExplorerService";

import { ArrowEnterUpRegular } from "@fluentui/react-icons";

import { AudioBus } from "core/AudioV2/abstractAudio/audioBus";

import { AudioExplorerServiceIdentity } from "./audioExplorerService";

export const AudioBusExplorerServiceDefinition: ServiceDefinition<[], [IAudioExplorerService]> = {
    friendlyName: "Buses",
    consumes: [AudioExplorerServiceIdentity],
    factory: (audioExplorerService) => {
        const sectionRegistration = audioExplorerService.addSection({
            displayName: "Buses",
            order: 2,
            getRootEntities: (audioEngines) =>
                audioEngines.flatMap((audioEngine) => Array.from(audioEngine.buses)).filter((b) => b instanceof MainAudioBus || (b instanceof AudioBus && !b.outBus)),
            getEntityChildren: (bus) => AllAudioEngines().flatMap((audioEngine) => Array.from(audioEngine.buses).filter((b) => b instanceof AudioBus && b.outBus === bus)),
            getEntityDisplayName: (bus) => bus.name,
            getEntityParent: (bus) => (bus as AudioBus).outBus!,
            isChild: (bus) => (bus instanceof AudioBus ? bus.outBus !== null : false),
            entityIcon: () => <ArrowEnterUpRegular />,
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
