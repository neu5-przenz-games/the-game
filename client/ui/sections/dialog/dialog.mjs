import { UIDialogConfirm } from "./confirm/confirm.mjs";
import { UIDialogLootingBag } from "./lootingBag/lootingBag.mjs";
import { UIDialogMap } from "./map/map.mjs";
import { UIDialogWrapper } from "./wrapper/wrapper.mjs";

const UIDialog = {
  confirm: new UIDialogConfirm(),
  lootingBag: new UIDialogLootingBag(),
  map: new UIDialogMap(),
  wrapper: new UIDialogWrapper(),
};

export { UIDialog };
