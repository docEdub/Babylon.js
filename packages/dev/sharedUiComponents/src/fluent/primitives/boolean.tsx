// eslint-disable-next-line import/no-internal-modules

import type { SwitchOnChangeData, SwitchProps } from "@fluentui/react-components";
import type { ChangeEvent, FunctionComponent } from "react";

import { makeStyles, Switch } from "@fluentui/react-components";
import { useCallback, useMemo, useState } from "react";

/**
 * This is a primitive fluent boolean switch component whose only knowledge is the shared styling across all tools
 */

const useBooleanStyles = makeStyles({
    switch: {
        marginLeft: "auto",
    },
    indicator: {
        marginRight: 0,
    },
});

type BooleanProps = SwitchProps;
export const Boolean: FunctionComponent<SwitchProps> = (props: BooleanProps) => {
    const classes = useBooleanStyles();
    const indicatorProps = useMemo<SwitchProps["indicator"]>(() => ({ className: classes.indicator }), [classes.indicator]);

    const [checked, setChecked] = useState(() => props.checked ?? false);

    const onChange = useCallback((event: ChangeEvent<HTMLInputElement>, data: SwitchOnChangeData) => {
        props.onChange && props.onChange(event, data);
        setChecked(event.target.checked);
    }, []);

    return <Switch {...props} className={classes.switch} indicator={indicatorProps} checked={checked} onChange={onChange} />;
};
