// eslint-disable-next-line import/no-internal-modules
import type { AudioEngineV2, IDisposable, Nullable } from "core/index";

import type { TreeItemValue, TreeOpenChangeData, TreeOpenChangeEvent } from "@fluentui/react-components";
import type { ComponentType, FunctionComponent } from "react";
import type { IService, ServiceDefinition } from "../../../modularity/serviceDefinition";
import type { IAudioContext } from "../../audioContext";
import type { ISelectionService } from "../../selectionService";
import type { IShellService } from "../../shellService";

import { Body1, Body1Strong, Button, FlatTree, FlatTreeItem, makeStyles, tokens, Tooltip, TreeItemLayout } from "@fluentui/react-components";
import { VirtualizerScrollView } from "@fluentui/react-components/unstable";
import { HeadphonesSoundWaveRegular } from "@fluentui/react-icons";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useObservableState, useOrderedObservableCollection } from "../../../hooks/observableHooks";
import { TraverseGraph } from "../../../misc/graphUtils";
import { ObservableCollection } from "../../../misc/observableCollection";
import { AudioContextIdentity } from "../../audioContext";
import { SelectionServiceIdentity } from "../../selectionService";
import { ShellServiceIdentity } from "../../shellService";

type EntityBase = Readonly<{
    uniqueId: number;
    parent?: Nullable<EntityBase>;
}>;

export type AudioExplorerSection<T extends EntityBase> = Readonly<{
    /**
     * The display name of the section (e.g. "Nodes", "Materials", etc.).
     */
    displayName: string;

    /**
     * An optional order for the section, relative to other sections.
     * Defaults to 0.
     */
    order?: number;

    /**
     *
     */
    getSounds: (audioEngines: Array<AudioEngineV2>) => readonly T[];
    /**
     *
     */
    getEntityChildren?: (entity: T) => readonly T[];
    /**
     *
     */
    getEntityDisplayName: (entity: T) => string;
    /**
     *
     */
    entityIcon?: ComponentType<{
        /**
         *
         */
        entity: T;
    }>;
    /**
     *
     */
    watch: (audioEngines: Array<AudioEngineV2>, onAdded: (entity: T) => void, onRemoved: (entity: T) => void) => IDisposable;
}>;

export type AudioExplorerEntityCommand<T extends EntityBase> = Readonly<{
    /**
     *
     */
    order: number;
    /**
     *
     */
    predicate: (entity: unknown) => entity is T;
    /**
     *
     */
    execute: (audioEngines: Array<AudioEngineV2>, entity: T) => void;
    /**
     *
     */
    displayName: string;
    /**
     *
     */
    icon: ComponentType<{
        /**
         *
         */
        entity: T;
    }>;
}>;

export const AudioExplorerServiceIdentity = Symbol("AudioExplorer");
/**
 *
 */
export interface IAudioExplorerService extends IService<typeof AudioExplorerServiceIdentity> {
    addSection<T extends EntityBase>(section: AudioExplorerSection<T>): IDisposable;
    addCommand<T extends EntityBase>(provider: AudioExplorerEntityCommand<T>): IDisposable;
}

type TreeItemData =
    | {
          type: "section";
          sectionName: string;
          hasChildren: boolean;
      }
    | {
          type: "entity";
          entity: EntityBase;
          depth: number;
          parent: Nullable<TreeItemValue>;
          hasChildren: boolean;
          title: string;
          icon?: ComponentType<{ entity: EntityBase }>;
      };

// eslint-disable-next-line @typescript-eslint/naming-convention
const useStyles = makeStyles({
    rootDiv: {
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    },
    tree: {
        margin: tokens.spacingHorizontalXS,
        rowGap: 0,
        overflow: "hidden",
        flex: 1,
    },
});

export const AudioExplorerServiceDefinition: ServiceDefinition<[IAudioExplorerService], [IAudioContext, IShellService, ISelectionService]> = {
    friendlyName: "Audio Explorer",
    produces: [AudioExplorerServiceIdentity],
    consumes: [AudioContextIdentity, ShellServiceIdentity, SelectionServiceIdentity],
    factory: (audioContext, shellService, selectionService) => {
        const sectionsCollection = new ObservableCollection<AudioExplorerSection<EntityBase>>();
        const commandsCollection = new ObservableCollection<AudioExplorerEntityCommand<EntityBase>>();

        // eslint-disable-next-line @typescript-eslint/naming-convention, jsdoc/require-jsdoc
        const AudioExplorer: FunctionComponent<{ audioEngines: Array<AudioEngineV2> }> = ({ audioEngines }) => {
            const classes = useStyles();

            const sections = useOrderedObservableCollection(sectionsCollection);
            const commands = useOrderedObservableCollection(commandsCollection);

            const selectedItem = useObservableState(() => selectionService.selectedEntity, selectionService.onSelectedEntityChanged);
            const [openItems, setOpenItems] = useState(new Set<TreeItemValue>());

            const [audioVersion, setAudioVersion] = useState(0);

            // For the filter, we should maybe to the traversal but use onAfterNode so that if the filter matches, we make sure to include the full parent chain.
            // Then just reverse the array of nodes before returning it.
            const [itemsFilter /*, setItemsFilter*/] = useState("");

            useEffect(() => {
                setAudioVersion((version) => version + 1);
            }, [audioEngines]);

            useEffect(() => {
                const onAudioItemAdded = () => {
                    setAudioVersion((version) => version + 1);
                };

                const onAudioItemRemoved = (item: EntityBase) => {
                    setAudioVersion((version) => version + 1);

                    if (openItems.delete(item.uniqueId)) {
                        setOpenItems(new Set(openItems));
                    }

                    if (item === selectedItem) {
                        selectionService.selectedEntity = null;
                    }
                };

                const watchTokens = sections.map((section) => section.watch(audioEngines, onAudioItemAdded, onAudioItemRemoved));

                return () => {
                    for (const token of watchTokens) {
                        token.dispose();
                    }
                };
            }, [sections, openItems]);

            const visibleItems = useMemo(() => {
                const visibleItems: TreeItemData[] = [];

                for (const section of sections) {
                    visibleItems.push({
                        type: "section",
                        sectionName: section.displayName,
                        hasChildren: section.getSounds(audioEngines).length > 0,
                    });

                    if (openItems.has(section.displayName)) {
                        let depth = 1;
                        TraverseGraph(
                            section.getSounds(audioEngines),
                            (entity) => {
                                if (openItems.has(entity.uniqueId) && section.getEntityChildren) {
                                    return section.getEntityChildren(entity);
                                }
                                return null;
                            },
                            (entity) => {
                                depth++;
                                visibleItems.push({
                                    type: "entity",
                                    entity,
                                    depth,
                                    parent: entity.parent?.uniqueId ?? section.displayName,
                                    hasChildren: !!section.getEntityChildren && section.getEntityChildren(entity).length > 0,
                                    title: section.getEntityDisplayName(entity),
                                    icon: section.entityIcon,
                                });
                            },
                            () => {
                                depth--;
                            }
                        );
                    }
                }

                return visibleItems;
            }, [audioEngines, audioVersion, sections, openItems, itemsFilter]);

            const onOpenChange = useCallback(
                (event: TreeOpenChangeEvent, data: TreeOpenChangeData) => {
                    // This makes it so we only consider a click on the chevron to be expanding/collapsing an item, not clicking anywhere on the item.
                    if (data.type !== "Click" && data.type !== "Enter") {
                        setOpenItems(data.openItems);
                    }
                },
                [setOpenItems]
            );

            return (
                <div className={classes.rootDiv}>
                    <FlatTree className={classes.tree} openItems={openItems} onOpenChange={onOpenChange} aria-label="Scene Explorer Tree">
                        <VirtualizerScrollView numItems={visibleItems.length} itemSize={32} container={{ style: { overflowX: "hidden" } }}>
                            {(index: number) => {
                                const item = visibleItems[index];

                                if (item.type === "section") {
                                    return (
                                        <FlatTreeItem
                                            key={item.sectionName}
                                            value={item.sectionName}
                                            itemType={item.hasChildren ? "branch" : "leaf"}
                                            parentValue={undefined}
                                            aria-level={1}
                                            aria-setsize={1}
                                            aria-posinset={1}
                                        >
                                            <TreeItemLayout>
                                                <Body1Strong wrap={false} truncate>
                                                    {item.sectionName.substring(0, 100)}
                                                </Body1Strong>
                                            </TreeItemLayout>
                                        </FlatTreeItem>
                                    );
                                } else {
                                    return (
                                        <FlatTreeItem
                                            key={item.entity.uniqueId}
                                            value={item.entity.uniqueId}
                                            itemType={item.hasChildren ? "branch" : "leaf"}
                                            parentValue={item.parent ?? undefined}
                                            aria-level={item.depth}
                                            aria-setsize={1}
                                            aria-posinset={1}
                                            onClick={() => (selectionService.selectedEntity = item.entity)}
                                        >
                                            <TreeItemLayout
                                                iconBefore={item.icon ? <item.icon entity={item.entity} /> : null}
                                                style={item.entity === selectedItem ? { backgroundColor: tokens.colorNeutralBackground1Selected } : undefined}
                                                actions={commands
                                                    .filter((command) => command.predicate(item.entity))
                                                    .map((command) => (
                                                        <Tooltip key={command.displayName} content={command.displayName} relationship="label">
                                                            <Button
                                                                icon={<command.icon entity={item.entity} />}
                                                                appearance="subtle"
                                                                onClick={() => command.execute(audioEngines, item.entity)}
                                                            />
                                                        </Tooltip>
                                                    ))}
                                            >
                                                <Body1 wrap={false} truncate>
                                                    {item.title.substring(0, 100)}
                                                </Body1>
                                            </TreeItemLayout>
                                        </FlatTreeItem>
                                    );
                                }
                            }}
                        </VirtualizerScrollView>
                    </FlatTree>
                </div>
            );
        };

        const registration = shellService.addSidePane({
            key: "Audio Explorer",
            title: "Audio Explorer",
            icon: HeadphonesSoundWaveRegular,
            horizontalLocation: "left",
            suppressTeachingMoment: true,
            content: () => {
                const audioEngines = useObservableState(() => audioContext.currentAudioEngines, audioContext.currentAudioEnginesObservable);
                return <>{audioEngines && <AudioExplorer audioEngines={audioEngines} />}</>;
            },
        });

        return {
            addSection: (section) => sectionsCollection.add(section as AudioExplorerSection<EntityBase>),
            addCommand: (command) => commandsCollection.add(command as AudioExplorerEntityCommand<EntityBase>),
            dispose: () => registration.dispose(),
        };
    },
};

// TODO: There is lots of copy-paste code here from sceneExplorerService.tsx. Consider sharing code.
