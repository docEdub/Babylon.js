// eslint-disable-next-line import/no-internal-modules
import type { Observable } from "core/index";

import type { ChangeEvent, FunctionComponent } from "react";

import { useCallback } from "react";
import { useObservableState } from "../hooks/observableHooks";
import { Boolean } from "shared-ui-components/fluent/primitives/boolean";

export type BoundProps = {
    accessor: () => boolean;
    mutator?: (value: boolean) => void;
    observable?: Observable<any>;
};

/**
 * Maps a primitive boolean component to one which uses an observable to detect changes / re-render
 * @param param0
 * @returns
 */
export const BoundBoolean: FunctionComponent<BoundProps> = ({ accessor, mutator, observable }) => {
    const value = useObservableState(accessor, observable);

    const onChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            mutator?.(event.target.checked);
        },
        [mutator]
    );

    return <Boolean checked={value} onChange={onChange} />;
};
