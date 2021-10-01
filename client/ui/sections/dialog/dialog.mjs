const DIALOG_WRAPPER_CLASSNAME = "dialog-wrapper";
const DIALOG_CLOSE_BUTTON_CLASSNAME = "dialog-header__close-button";

export class UIDialog {
  constructor() {
    const [dialogWrapper] = document.getElementsByClassName(
      DIALOG_WRAPPER_CLASSNAME
    );
    const [dialogCloseButton] = document.getElementsByClassName(
      DIALOG_CLOSE_BUTTON_CLASSNAME
    );

    this.dialogWrapper = dialogWrapper;
    this.dialogCloseButton = dialogCloseButton;

    this.dialogCloseButton.onclick = () => {
      this.close();
    };
  }

  close() {
    this.dialogWrapper.classList.add("hidden");
  }

  show() {
    this.dialogWrapper.classList.remove("hidden");
  }
}
