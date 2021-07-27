const TABS = {
  EQUIPMENT: "equipment",
  CRAFTING: "crafting",
  SKILLS: "skills",
};

const ACTIVE_TAB_CLASSNAME = "tabs__option--active";
const ACTIVE_TAB_CONTENT_CLASSNAME = "tabs__content--active";

export default class UITabs {
  constructor() {
    const [tabsOptions] = document.getElementsByClassName("tabs__options");
    const [...tabOption] = document.getElementsByClassName("tabs__option");
    const [...tabContent] = document.getElementsByClassName("tabs__content");

    this.active = TABS.EQUIPMENT;
    this.tabsOptions = tabsOptions;
    this.tabOption = tabOption;
    this.tabContent = tabContent;

    this.tabsOptions.onclick = (ev) => {
      const { tab } = ev.target.dataset;

      if (tab) {
        this.setActive(tab);
      }
    };

    this.clearActive = () => {
      this.active = null;
      this.tabOption.forEach((tab) =>
        tab.classList.remove(ACTIVE_TAB_CLASSNAME)
      );
      this.tabContent.forEach((tab) =>
        tab.classList.remove(ACTIVE_TAB_CONTENT_CLASSNAME)
      );
    };

    this.setActive = (tab) => {
      if (tab === this.active) {
        return;
      }

      this.clearActive();

      this.active = tab;

      tabOption
        .find((el) => el.dataset.tab === tab)
        .classList.add(ACTIVE_TAB_CLASSNAME);
      tabContent
        .find((el) => el.dataset.tab === tab)
        .classList.add(ACTIVE_TAB_CONTENT_CLASSNAME);
    };
  }
}
