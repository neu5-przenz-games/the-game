import { UIDialogConfirm } from "./confirm/confirm.mjs";
import { UIDialogLootingBag } from "./lootingBag/lootingBag.mjs";
import { UIDialogWrapper } from "./wrapper/wrapper.mjs";

const UIDialog = {
  confirm: new UIDialogConfirm(),
  lootingBag: new UIDialogLootingBag(),
  wrapper: new UIDialogWrapper(),
};

export { UIDialog };
