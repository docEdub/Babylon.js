import type { FunctionComponent } from "react";

import type { ISettingsContext } from "../../services/settingsContext";

import { SwitchPropertyLine } from "shared-ui-components/fluent/hoc/propertyLines/switchPropertyLine";
import { TextAreaPropertyLine } from "shared-ui-components/fluent/hoc/propertyLines/textAreaPropertyLine";
import { TextPropertyLine } from "shared-ui-components/fluent/hoc/propertyLines/textPropertyLine";
import { BoundProperty } from "./boundProperty";

enum MetadataTypes {
    NULL = "null",
    STRING = "string",
    OBJECT = "Object",
    JSON = "JSON",
}

export interface IMetadataContainer {
    metadata: any;
}

class MetadataUtils {
    private _prettyJSON = false;
    private _preventObjectCorruption = false;

    constructor(public readonly entity: IMetadataContainer) {}

    get prettyJSON(): boolean {
        return this._prettyJSON;
    }

    set prettyJSON(value: boolean) {
        this._prettyJSON = value;
    }

    get preventObjectCorruption(): boolean {
        return this._preventObjectCorruption;
    }

    set preventObjectCorruption(value: boolean) {
        this._preventObjectCorruption = value;
    }

    get entityType(): MetadataTypes {
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

    get data(): string {
        switch (this.entityType) {
            case MetadataTypes.NULL:
                return "";
            case MetadataTypes.STRING:
                return this.entity.metadata;
            case MetadataTypes.OBJECT:
                return "";
            case MetadataTypes.JSON:
                return JSON.stringify(this.entity.metadata, undefined, this.prettyJSON ? 2 : undefined);
        }
    }

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

export const MetadataProperties: FunctionComponent<{ entity: IMetadataContainer; settings: ISettingsContext }> = (props) => {
    const { entity, settings } = props;

    const metadataUtils = new MetadataUtils(entity);

    return (
        <>
            {/* <TextPropertyLine label={"Property type"} value={metadataUtils.entityType} /> */}
            <BoundProperty component={TextPropertyLine} label={"Property type"} target={metadataUtils} propertyKey="entityType" />
            <BoundProperty component={SwitchPropertyLine} label={"Prevent Object corruption"} target={metadataUtils} propertyKey="preventObjectCorruption" />
            <BoundProperty component={SwitchPropertyLine} label={"Pretty JSON"} target={metadataUtils} propertyKey="prettyJSON" />
            {/* TODO: Return different data for "Object" types. See metadataPropertyGridComponent.tsx for v1 implementation. */}
            {/* TODO: Disable text area in some cases. See metadataPropertyGridComponent.tsx for v1 implementation. */}
            <BoundProperty component={TextAreaPropertyLine} label={"Data"} target={metadataUtils} propertyKey="data" />
            {/* TODO: Add buttons. See metadataPropertyGridComponent.tsx for v1 implementation. */}
        </>
    );
};
