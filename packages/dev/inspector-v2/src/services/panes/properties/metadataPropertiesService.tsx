import type { ServiceDefinition } from "../../../modularity/serviceDefinition";
import type { IPropertiesService } from "./propertiesService";

import { Node } from "core/node";
import { SettingsContextIdentity, type ISettingsContext } from "../../settingsContext";
import { PropertiesServiceIdentity } from "./propertiesService";
import { MetadataProperties } from "../../../components/properties/metadataProperties";

export const MetadataPropertiesServiceDefinition: ServiceDefinition<[], [IPropertiesService, ISettingsContext]> = {
    friendlyName: "Metadata Properties",
    consumes: [PropertiesServiceIdentity, SettingsContextIdentity],
    factory: (propertiesService, settingsContent) => {
        const contentRegistration = propertiesService.addSectionContent({
            key: "Metadata Properties",
            // TransformNode and Bone don't share a common base class, but both have the same transform related properties.
            predicate: (entity: unknown) => entity instanceof Node,
            content: [
                {
                    section: "Metadata",
                    component: ({ context }) => <MetadataProperties node={context} settings={settingsContent} />,
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
