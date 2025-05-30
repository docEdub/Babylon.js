// eslint-disable-next-line import/no-internal-modules
import type { AbstractMesh } from "core/index";

import type { FunctionComponent } from "react";

import { PropertyLine } from "@dev/shared-ui-components/src/fluent/propertyLine";
import { Switch } from "@dev/shared-ui-components/src/fluent/primitives/switch";
import { ButtonLine } from "@dev/shared-ui-components/src/fluent/primitives/button";
import { Dropdown } from "@dev/shared-ui-components/src/fluent/primitives/dropdown";
import { BoundSwitch } from "../../../../components/boundSwitch";

export const MeshGeneralProperties: FunctionComponent<{ entity: AbstractMesh }> = ({ entity: mesh }) => {
    return (
        <>
            <PropertyLine label="Is enabled" description="Determines whether a mesh is enabled within the scene">
                <BoundSwitch accessor={() => mesh.isEnabled(false)} mutator={(value) => mesh.setEnabled(value)} observable={mesh.onEnabledStateChangedObservable} />
            </PropertyLine>
            <PropertyLine label="Is visible" description="Determines whether a mesh is visible">
                <Switch checked={mesh.isVisible} onChange={(ev) => (mesh.isVisible = ev.target.checked)} />
            </PropertyLine>
            <PropertyLine label="Fake dropdown ">
                <Dropdown
                    options={[
                        { value: 1, label: "One" },
                        { value: 2, label: "Two" },
                    ]}
                    onSelect={() => {}}
                    defaultValue={1}
                />
            </PropertyLine>
            <ButtonLine label="Dispose" onClick={(event) => mesh.dispose()} />
        </>
    );
};
