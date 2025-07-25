import type { IDisposable, Scene } from "core/index";

import type { DynamicAccordionSection, DynamicAccordionSectionContent } from "../../components/extensibleAccordion";
import type { IService, ServiceDefinition } from "../../modularity/serviceDefinition";
import type { ISceneContext } from "../sceneContext";
import type { IShellService } from "../shellService";

import { SettingsRegular } from "@fluentui/react-icons";

import { DataStorage } from "core/Misc/dataStorage";
import { Observable } from "core/Misc/observable";
import { SwitchPropertyLine } from "shared-ui-components/fluent/hoc/propertyLines/switchPropertyLine";
import { AccordionSection } from "shared-ui-components/fluent/primitives/accordion";
import { ExtensibleAccordion } from "../../components/extensibleAccordion";
import { useObservableCollection, useObservableState, useOrderedObservableCollection } from "../../hooks/observableHooks";
import { ObservableCollection } from "../../misc/observableCollection";
import { SceneContextIdentity } from "../sceneContext";
import { SettingsContextIdentity, type ISettingsContext } from "../settingsContext";
import { ShellServiceIdentity } from "../shellService";

export const SettingsServiceIdentity = Symbol("SettingsService");

/**
 * Allows new sections or content to be added to the Settings pane.
 */
export interface ISettingsService extends IService<typeof SettingsServiceIdentity> {
    /**
     * Adds a new section.
     * @param section A description of the section to add.
     */
    addSection(section: DynamicAccordionSection): IDisposable;

    /**
     * Adds content to one or more sections.
     * @param content A description of the content to add.
     */
    addSectionContent(content: DynamicAccordionSectionContent<Scene>): IDisposable;
}

export const SettingsServiceDefinition: ServiceDefinition<[ISettingsContext, ISettingsService], [IShellService, ISceneContext]> = {
    friendlyName: "Settings",
    consumes: [ShellServiceIdentity, SceneContextIdentity],
    produces: [SettingsContextIdentity, SettingsServiceIdentity],
    factory: (shellService, sceneContext) => {
        const sectionsCollection = new ObservableCollection<DynamicAccordionSection>();
        const sectionContentCollection = new ObservableCollection<DynamicAccordionSectionContent<Scene>>();

        let useDegrees = DataStorage.ReadBoolean("settings_useDegrees", false);
        let ignoreBackfacesForPicking = DataStorage.ReadBoolean("settings_ignoreBackfacesForPicking", false);
        const settings = {
            get useDegrees() {
                return useDegrees;
            },
            set useDegrees(value: boolean) {
                if (useDegrees === value) {
                    return; // No change, no need to notify
                }
                useDegrees = value;

                DataStorage.WriteBoolean("settings_useDegrees", useDegrees);

                this.settingsChangedObservable.notifyObservers(this);
            },
            get ignoreBackfacesForPicking() {
                return ignoreBackfacesForPicking;
            },
            set ignoreBackfacesForPicking(value: boolean) {
                if (ignoreBackfacesForPicking === value) {
                    return; // No change, no need to notify
                }
                ignoreBackfacesForPicking = value;

                DataStorage.WriteBoolean("settings_ignoreBackfacesForPicking", ignoreBackfacesForPicking);
                this.settingsChangedObservable.notifyObservers(this);
            },
            settingsChangedObservable: new Observable<ISettingsContext>(),
            addSection: (section: DynamicAccordionSection) => sectionsCollection.add(section),
            addSectionContent: (content: DynamicAccordionSectionContent<Scene>) => sectionContentCollection.add(content),
            dispose: () => {},
        };

        const registration = shellService.addSidePane({
            key: "Settings",
            title: "Settings",
            icon: SettingsRegular,
            horizontalLocation: "right",
            order: 500,
            suppressTeachingMoment: true,
            content: () => {
                const sections = useOrderedObservableCollection(sectionsCollection);
                const sectionContent = useObservableCollection(sectionContentCollection);
                const scene = useObservableState(() => sceneContext.currentScene, sceneContext.currentSceneObservable);

                return (
                    <>
                        {scene && (
                            <ExtensibleAccordion sections={sections} sectionContent={sectionContent} context={scene}>
                                <AccordionSection title="UI">
                                    <SwitchPropertyLine
                                        label="Use Degrees"
                                        description="Using degrees instead of radians."
                                        value={settings.useDegrees}
                                        onChange={(checked) => {
                                            settings.useDegrees = checked;
                                        }}
                                    />
                                    <SwitchPropertyLine
                                        label="Ignore backfaces for picking"
                                        description="Ignore backfaces when picking."
                                        value={settings.ignoreBackfacesForPicking}
                                        onChange={(checked) => {
                                            settings.ignoreBackfacesForPicking = checked;
                                        }}
                                    />
                                </AccordionSection>
                            </ExtensibleAccordion>
                        )}
                    </>
                );
            },
        });

        settings.dispose = () => registration.dispose();

        return settings;
    },
};
