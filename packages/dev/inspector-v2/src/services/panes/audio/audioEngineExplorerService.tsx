// eslint-disable-next-line import/no-internal-modules
import type { Observer } from "core/index";

import type { ServiceDefinition } from "../../../modularity/serviceDefinition";
import type { IAudioExplorerService } from "./audioExplorerService";

import { HeadphonesSoundWaveRegular } from "@fluentui/react-icons";

import { AudioExplorerServiceIdentity } from "./audioExplorerService";

export const AudioEngineExplorerServiceDefinition: ServiceDefinition<[], [IAudioExplorerService]> = {
    friendlyName: "Audio Engines",
    consumes: [AudioExplorerServiceIdentity],
    factory: (audioExplorerService) => {
        const sectionRegistration = audioExplorerService.addSection({
            displayName: "Audio Engines",
            order: 1,
            getRootEntities: (audioEngines) => audioEngines,
            getEntityDisplayName: (audioEngine) => audioEngine.name,
            entityIcon: () => <HeadphonesSoundWaveRegular />,
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
