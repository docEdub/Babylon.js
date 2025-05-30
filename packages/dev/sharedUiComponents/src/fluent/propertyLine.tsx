import { Button, InfoLabel, makeStyles } from "@fluentui/react-components";

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
        height: "40px", // consistent height
        marginBottom: "8px", // consistent spacing between lines
        borderBottom: "1px solid #eee", // optional separator
        fontSize: "14px",
    },
    label: {
        width: "33%",
        textAlign: "left",
        fontWeight: "bold",
    },
    rightContent: { width: "67%", display: "flex" },
    fillRestOfRightContentWidth: { flex: 1 },
    copyButton: { width: "100px" },
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
                <div className={styles.fillRestOfRightContentWidth}>
                    <div style={{ width: "100%" }}>{props.children}</div>
                </div>

                {props.onCopy && (
                    <Button className={styles.copyButton} id="copyProperty" icon={<Copy24Regular />} onClick={() => props.onCopy && props.onCopy()} title="Copy to clipboard" />
                )}
            </div>
        </div>
    );
};
