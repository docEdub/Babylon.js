// eslint-disable-next-line import/no-internal-modules
import type { Observable } from "core/index";

import type { ChangeEvent, FunctionComponent } from "react";

import { useCallback } from "react";
import { useObservableState } from "../hooks/observableHooks";
import { Switch } from "shared-ui-components/fluent/primitives/switch";

export type BoundProps = {
    accessor: () => boolean;
    mutator?: (value: boolean) => void;
    observable?: Observable<any>;
};

/**
 * Maps a primitive Switch component to one which uses an observable to detect changes and re-render
 * @param param0
 * @returns
 */
export const BoundSwitch: FunctionComponent<BoundProps> = ({ accessor, mutator, observable }) => {
    const value = useObservableState(accessor, observable);

    const onChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            mutator?.(event.target.checked);
        },
        [mutator]
    );

    return <Switch checked={value} onChange={onChange} />;
};
