import type { Node } from "core/index";

import type { FunctionComponent } from "react";

import { NodeDropdownPropertyLine } from "shared-ui-components/fluent/hoc/propertyLines/dropdownPropertyLine";
import { LinkPropertyLine } from "shared-ui-components/fluent/hoc/propertyLines/linkPropertyLine";
import { SwitchPropertyLine } from "shared-ui-components/fluent/hoc/propertyLines/switchPropertyLine";
import { useProperty } from "../../../hooks/compoundPropertyHooks";
import { useObservableState } from "../../../hooks/observableHooks";
import { BoundProperty } from "../boundProperty";

export const NodeGeneralProperties: FunctionComponent<{ node: Node; setSelectedEntity: (entity: unknown) => void }> = (props) => {
    const { node, setSelectedEntity } = props;

    const parent = useProperty(node, "parent");
    const isEnabled = useObservableState(() => node.isEnabled(false), node.onEnabledStateChangedObservable);

    const nodes = node.getScene().getNodes();
    const nodeIds = Array.from(new Set(nodes.map((n) => n.id)));
    const dedupedNodes = nodeIds.map((id) => nodes.find((n) => n.id === id)!).filter((n) => n && n !== undefined);

    return (
        <>
            {parent && (
                <LinkPropertyLine
                    key="Link to parent"
                    label="Link to parent"
                    description={`A link to the parent of this node.`}
                    value={parent.name}
                    onLink={() => setSelectedEntity(parent)}
                />
            )}
            {node.getScene().getNodes().length > 1 && (
                <BoundProperty
                    component={NodeDropdownPropertyLine}
                    nullable
                    key="Parent"
                    label="Parent"
                    description="The parent of this node."
                    defaultValue={node.parent!}
                    options={dedupedNodes.map((n) => {
                        return { label: n.name, value: n };
                    })}
                    target={node}
                    propertyKey="parent"
                />
            )}
            <SwitchPropertyLine
                key="NodeIsEnabled"
                label="Is enabled"
                description="Whether the node is enabled or not."
                value={isEnabled}
                onChange={(checked) => node.setEnabled(checked)}
            />
        </>
    );
};
