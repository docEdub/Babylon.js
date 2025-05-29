import type { FunctionComponent } from "react";
import { PropertyLine } from "shared-ui-components/fluent/propertyLine";
import { Input } from "shared-ui-components/fluent/primitives/input";
import { copyCommandToClipboard } from "shared-ui-components/copyCommandToClipboard";

type CommonEntity = {
    id?: number;
    name?: string;
    uniqueId?: number;
    getClassName?: () => string;
};

export const CommonGeneralProperties: FunctionComponent<{ entity: CommonEntity }> = ({ entity: commonEntity }) => {
    return (
        <>
            {commonEntity.id !== undefined && <PropertyLine label="ID" children={commonEntity.id} />}
            {commonEntity.name !== undefined && (
                <PropertyLine label="Name" onCopy={() => copyCommandToClipboard(commonEntity.name || "")}>
                    <Input
                        defaultValue={commonEntity.name}
                        onChange={(event) => {
                            commonEntity.name = event.target.value; // TODO update so it rerenders
                        }}
                    />
                </PropertyLine>
            )}
            {commonEntity.uniqueId !== undefined && <PropertyLine label="UniqueId" children={commonEntity.uniqueId} />}
            {commonEntity.getClassName !== undefined && <PropertyLine label="Class" children={commonEntity.getClassName()} />}
        </>
    );
};

// import type { FunctionComponent } from "react";
// import { PropertyLine } from "shared-ui-components/fluent/styledWrappers";

// type CommonEntity = {
//     id?: number;
//     name?: string;
//     uniqueId?: number;
//     getClassName?: () => string;
// };

// export const CommonGeneralProperties: FunctionComponent<{ entity: CommonEntity }> = ({ entity: commonEntity }) => {
//     const properties = {
//         ID: commonEntity.id,
//         Name: commonEntity.name,
//         UniqueId: commonEntity.uniqueId,
//         Class: commonEntity.getClassName ? commonEntity.getClassName() : undefined,
//     };

//     return (
//         <>
//             {Object.entries(properties).forEach(([key, value]) => {
//                 return value !== undefined && <PropertyLine key={key} label={key} children={<>{value}</>} />;
//             })}
//         </>
//     );
// };
