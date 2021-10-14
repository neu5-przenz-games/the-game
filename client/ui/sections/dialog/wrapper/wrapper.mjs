const DIALOG_WRAPPER_CLASSNAME = "dialog-wrapper";
const DIALOG_CLASSNAME = "dialog";
const DIALOG_CLOSE_BUTTON_CLASSNAME = "dialog-header__close-button";
const DIALOG_CONTENT_CLASSNAME = "dialog-content";
const DIALOG_FOOTER_CLASSNAME = "dialog-footer";

export class UIDialogWrapper {
  constructor() {
    const [dialogWrapper] = document.getElementsByClassName(
      DIALOG_WRAPPER_CLASSNAME
    );
    const [dialog] = document.getElementsByClassName(DIALOG_CLASSNAME);
    const [dialogCloseButton] = document.getElementsByClassName(
      DIALOG_CLOSE_BUTTON_CLASSNAME
    );
    const [dialogContent] = document.getElementsByClassName(
      DIALOG_CONTENT_CLASSNAME
    );
    const [dialogFooter] = document.getElementsByClassName(
      DIALOG_FOOTER_CLASSNAME
    );

    this.dialogWrapper = dialogWrapper;
    this.dialog = dialog;
    this.dialogCloseButton = dialogCloseButton;
    this.dialogContent = dialogContent;
    this.dialogFooter = dialogFooter;

    this.dialogCloseButton.onclick = () => {
      this.close();
    };
  }

  close() {
    this.dialogWrapper.classList.add("hidden");
  }

  setContent(content) {
    this.dialogContent.textContent = "";

    if (content) {
      this.dialogContent.appendChild(content);
    }
  }

  setFooter(footer) {
    this.dialogFooter.textContent = "";

    if (footer) {
      this.dialogFooter.appendChild(footer);
    }
  }

  show({ content, footer }) {
    this.setContent(content);
    this.setFooter(footer);

    this.dialogWrapper.classList.remove("hidden");
  }
}
