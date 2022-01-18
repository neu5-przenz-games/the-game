import { UIDialogWrapper } from "../wrapper/wrapper.mjs";
import { createBtn } from "../../../utils/index.mjs";

const ACTIONS = {
  CANCEL: "CANCEL",
  CONFIRM: "CONFIRM",
};

const getFooter = () => {
  const fragment = new DocumentFragment();

  const cancelBtn = createBtn({
    datasets: [{ name: "action", value: ACTIONS.CANCEL }],
    text: "Cancel",
  });

  const confirmBtn = createBtn({
    datasets: [{ name: "action", value: ACTIONS.CONFIRM }],
    text: "Confirm",
  });

  fragment.appendChild(cancelBtn);
  fragment.appendChild(confirmBtn);

  return fragment;
};

export class UIDialogConfirm extends UIDialogWrapper {
  setListeners({ name, dialogCb }) {
    this.dialog.onclick = (ev) => {
      const { action } = ev.target.dataset;

      if (action === ACTIONS.CONFIRM) {
        dialogCb({
          name,
          value: true,
          checkboxName: "attackAlly",
          socketName: "settings:checkbox:set",
        });
      }
      if (action === ACTIONS.CANCEL) {
        super.close();
      }
    };
  }

  getContent = () => {
    const p = document.createElement("p");
    p.textContent = `Do you want to attack your ally - ${this.selectedObjectDisplayName}?`;

    return p;
  };

  show({ name, selectedObjectDisplayName, dialogCb }) {
    this.setListeners({ name, dialogCb });
    this.selectedObjectDisplayName = selectedObjectDisplayName;

    const content = this.getContent();
    const footer = getFooter();

    super.show({
      content,
      footer,
    });
  }
}
