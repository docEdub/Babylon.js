// eslint-disable-next-line import/no-internal-modules
import type { Observer } from "core/index";

import type { ServiceDefinition } from "../../../modularity/serviceDefinition";
import type { IAudioExplorerService } from "./audioExplorerService";

import { SoundWaveCircleRegular } from "@fluentui/react-icons";

import { AudioExplorerServiceIdentity } from "./audioExplorerService";

export const SoundExplorerServiceDefinition: ServiceDefinition<[], [IAudioExplorerService]> = {
    friendlyName: "Sound Hierarchy",
    consumes: [AudioExplorerServiceIdentity],
    factory: (audioExplorerService) => {
        const sectionRegistration = audioExplorerService.addSection({
            displayName: "Sounds",
            order: 2,
            getRootEntities: (audioEngine) => Array.from(audioEngine.sounds),
            getEntityDisplayName: (sound) => sound.name,
            entityIcon: () => <SoundWaveCircleRegular />,
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
