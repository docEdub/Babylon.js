import type { FunctionComponent } from "react";

import type { Node } from "core/index";
import type { ISettingsContext } from "../../services/settingsContext";

import { TextPropertyLine } from "shared-ui-components/fluent/hoc/propertyLines/textPropertyLine";

enum MetadataTypes {
    UNDEFINED = "undefined",
    NULL = "null",
    STRING = "string",
    OBJECT = "Object",
    JSON = "JSON",
}

interface IEntityWithMetadata {
    metadata: any;
}

class MetadataUtils {
    constructor(public entity: IEntityWithMetadata) {}

    /**
     * Determines the Metadata type
     * @param entity Picked entity
     * @returns MetadataTypes
     */
    getEntityType(): MetadataTypes {
        if (Object.prototype.hasOwnProperty.call(this.entity, "metadata")) {
            const meta = this.entity.metadata;
            if (this.isString(meta)) {
                return MetadataTypes.STRING;
            }
            if (meta === null) {
                return MetadataTypes.NULL;
            }
            if (!this.objectCanSafelyStringify(meta)) {
                return MetadataTypes.OBJECT;
            }
            return MetadataTypes.JSON;
        }
        return MetadataTypes.UNDEFINED;
    }

    /**
     * @param input - any input
     * @returns is string
     */
    isString(input: any): boolean {
        return typeof input === "string" || input instanceof String;
    }

    /**
     * Recurse through an object to check for any Functions, returns False if found at least one
     * @param o Any Object, String or number
     * @returns Boolean
     */
    objectCanSafelyStringify(o: object | string | number | boolean): boolean {
        if (typeof o === "function") {
            return false;
        }
        if (o === null || o === true || o === false || typeof o === "number" || this.isString(o)) {
            return true;
        }

        if (typeof o === "object") {
            if (Object.values(o).length === 0) {
                return true;
            }
            return Object.values(o as Record<string, any>).every((value) => this.objectCanSafelyStringify(value));
        }

        if (Array.isArray(o)) {
            return o.every((value) => this.objectCanSafelyStringify(value));
        }

        return false;
    }
}

export const MetadataProperties: FunctionComponent<{ node: Node; settings: ISettingsContext }> = (props) => {
    const { node, settings } = props;

    const metadataUtils = new MetadataUtils(node);

    return (
        <>
            <TextPropertyLine nullable={false} key={node.id} label={"Property type"} value={metadataUtils.getEntityType()} />
        </>
    );
};
