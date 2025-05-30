import type { ServiceDefinition } from "../../modularity/serviceDefinition";
import type { IShellService } from "../shellService";

import { HeadphonesSoundWaveRegular } from "@fluentui/react-icons";

import { ShellServiceIdentity } from "../shellService";

export const AudioServiceDefinition: ServiceDefinition<[], [IShellService]> = {
    friendlyName: "Audio",
    consumes: [ShellServiceIdentity],
    factory: (shellService) => {
        const registration = shellService.addSidePane({
            key: "Audio",
            title: "Audio",
            icon: HeadphonesSoundWaveRegular,
            horizontalLocation: "left",
            suppressTeachingMoment: true,
            content: () => {
                return <></>;
            },
        });

        return {
            dispose: () => registration.dispose(),
        };
    },
};
