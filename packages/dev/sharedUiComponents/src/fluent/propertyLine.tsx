import { Button, InfoLabel, makeStyles, tokens } from "@fluentui/react-components";

import { Copy24Regular } from "@fluentui/react-icons";
import * as React from "react";

export interface IPropertyLineProps {
    children: React.ReactNode;
    label: string;
    description?: string;
    icon?: string;
    iconLabel?: string;
    onCopy?: () => void;
}

const usePropertyLineStyle = makeStyles({
    line: {
        width: "100%",
        display: "flex",
        alignItems: "center", // vertical center
        justifyContent: "flex-start", // horizontal left
        height: tokens.lineHeightBase400, // consistent height
        padding: `${tokens.spacingVerticalM} 0px`, // some padding within a line
        borderBottom: "1px solid #eee", // optional separator
    },
    label: {
        // label takes up 1/3 of the width
        width: "33%",
        textAlign: "left",
        fontWeight: "bold",
    },
    rightContent: { width: "67%", display: "flex", alignContent: "center", justifyContent: "flex-end" }, // with the remaining 2/3 of the width, flexbox
    copyButton: { width: "100px" }, // where the copyButton takes up 100px
    fillRestOfRightContentWidth: {
        // and the children take up the rest of the width, with their content right-aligned
        flex: 1,
        display: "flex",
        justifyContent: "flex-end", // pushes content to the right
        alignItems: "center", // vertical center
        marginRight: "10px", // some space on the right side of the property content
    },
});

/**
 * Property lines have an infolabel, optional icon, optional copy button, and a right context area for any control to modify that property
 * @param props
 * @returns
 */
export const PropertyLine: React.FC<IPropertyLineProps> = (props: IPropertyLineProps) => {
    const styles = usePropertyLineStyle();
    return (
        <div className={styles.line}>
            {
                // props.icon && <img src={props.icon} title={props.iconLabel} alt={props.iconLabel} color="black" className="icon" />
            }
            <InfoLabel className={styles.label} info={props.description}>
                {props.label}
            </InfoLabel>
            <div className={styles.rightContent}>
                <div className={styles.fillRestOfRightContentWidth}>{props.children}</div>

                {props.onCopy && (
                    <Button className={styles.copyButton} id="copyProperty" icon={<Copy24Regular />} onClick={() => props.onCopy && props.onCopy()} title="Copy to clipboard" />
                )}
            </div>
        </div>
    );
};
