import type { IMetadataContainer } from "../../../components/properties/metadataProperties";
import type { ServiceDefinition } from "../../../modularity/serviceDefinition";
import type { ISettingsContext } from "../../settingsContext";
import type { IPropertiesService } from "./propertiesService";

import { MetadataProperties } from "../../../components/properties/metadataProperties";
import { SettingsContextIdentity } from "../../settingsContext";
import { PropertiesServiceIdentity } from "./propertiesService";

function IsMetadataContainer(entity: unknown): entity is IMetadataContainer {
    return (entity as IMetadataContainer).metadata !== undefined;
}

export const MetadataPropertiesServiceDefinition: ServiceDefinition<[], [IPropertiesService, ISettingsContext]> = {
    friendlyName: "Metadata Properties",
    consumes: [PropertiesServiceIdentity, SettingsContextIdentity],
    factory: (propertiesService, settingsContent) => {
        const contentRegistration = propertiesService.addSectionContent({
            key: "Metadata Properties",
            // TransformNode and Bone don't share a common base class, but both have the same transform related properties.
            predicate: (entity: unknown) => IsMetadataContainer(entity),
            content: [
                {
                    section: "Metadata",
                    component: ({ context }) => <MetadataProperties entity={context} settings={settingsContent} />,
                },
            ],
        });

        return {
            dispose: () => {
                contentRegistration.dispose();
            },
        };
    },
};
