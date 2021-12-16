import { LEVEL_TYPES } from "../../shared/skills/index.mjs";
import {
  DEBUG_ITEMS_SETS_TYPES,
  DEBUG_PLAYER_SPEEDS_KEYS,
  DEBUG_PLAYER_TELEPORT_KEYS,
} from "../../shared/debugUtils/index.mjs";

export const debugMenu = (game) => {
  const sheet = document.createElement("style");
  sheet.innerHTML = `
.DEBUG_Container {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
}
.DEBUG_Container.show {
    width: 100%;
    height: 100%;
    overflow: scroll;
}
.DEBUG_ToggleBtn {
    border: none;
    background: rgba(255, 255, 255, 0.7);
    margin: 10px;
    padding: 10px;
    position: absolute;
    bottom: 0;
}
.DEBUG_Content {
    background: rgba(255, 255, 255, 0.6);
    display: none;
    padding: 10px;
}
.DEBUG_Container.show .DEBUG_Content {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}
.DEBUG_Container .DEBUG_Label {
  display: block;
  margin: 10px;
}
`;
  document.body.appendChild(sheet);

  // create container
  const DEBUGContainer = document.createElement("div");
  DEBUGContainer.classList.add("DEBUG_Container");

  // create debug menu button
  const DEBUGToggleBtn = document.createElement("button");
  DEBUGToggleBtn.classList.add("DEBUG_ToggleBtn");
  DEBUGToggleBtn.innerText = "debug";

  // create debug content wrapper
  const DEBUGContent = document.createElement("div");
  DEBUGContent.classList.add("DEBUG_Content");

  // create debug fieldset
  const DEBUGFieldset = document.createElement("fieldset");
  const DEBUGFieldsetLegend = document.createElement("legend");
  DEBUGFieldsetLegend.innerText = "debug settings";

  // create debug fields
  // clear players' items
  const DEBUGClearPlayerItemsLabel = document.createElement("label");
  DEBUGClearPlayerItemsLabel.classList.add("DEBUG_Label");
  DEBUGClearPlayerItemsLabel.innerText = "Clear player items";
  const DEBUGClearPlayerItemsBtn = document.createElement("button");
  DEBUGClearPlayerItemsBtn.innerText = "Clear";
  DEBUGClearPlayerItemsLabel.appendChild(DEBUGClearPlayerItemsBtn);

  // set players' equipment
  const DEBUGSetPlayerEquipmentLabel = document.createElement("label");
  DEBUGSetPlayerEquipmentLabel.classList.add("DEBUG_Label");
  DEBUGSetPlayerEquipmentLabel.innerText = "Set player items";

  const DEBUGSetPlayerEquipmentSelect = document.createElement("select");

  const DEBUGSetPlayerEquipmentBasicWarrior = document.createElement("option");
  DEBUGSetPlayerEquipmentBasicWarrior.innerText = "Basic warrior";
  DEBUGSetPlayerEquipmentBasicWarrior.value =
    DEBUG_ITEMS_SETS_TYPES.WARRIOR_BASIC;
  const DEBUGSetPlayerEquipmentProWarrior = document.createElement("option");
  DEBUGSetPlayerEquipmentProWarrior.innerText = "Pro warrior";
  DEBUGSetPlayerEquipmentProWarrior.value = DEBUG_ITEMS_SETS_TYPES.WARRIOR_PRO;
  const DEBUGSetPlayerEquipmentBasicArcher = document.createElement("option");
  DEBUGSetPlayerEquipmentBasicArcher.innerText = "Basic archer";
  DEBUGSetPlayerEquipmentBasicArcher.value =
    DEBUG_ITEMS_SETS_TYPES.ARCHER_BASIC;
  const DEBUGSetPlayerEquipmentProArcher = document.createElement("option");
  DEBUGSetPlayerEquipmentProArcher.innerText = "Pro archer";
  DEBUGSetPlayerEquipmentProArcher.value = DEBUG_ITEMS_SETS_TYPES.ARCHER_PRO;

  const DEBUGSetPlayerEquipmentBtn = document.createElement("button");
  DEBUGSetPlayerEquipmentBtn.innerText = "Set items";
  DEBUGSetPlayerEquipmentSelect.appendChild(
    DEBUGSetPlayerEquipmentBasicWarrior
  );
  DEBUGSetPlayerEquipmentSelect.appendChild(DEBUGSetPlayerEquipmentProWarrior);
  DEBUGSetPlayerEquipmentSelect.appendChild(DEBUGSetPlayerEquipmentBasicArcher);
  DEBUGSetPlayerEquipmentSelect.appendChild(DEBUGSetPlayerEquipmentProArcher);

  DEBUGSetPlayerEquipmentLabel.appendChild(DEBUGSetPlayerEquipmentSelect);
  DEBUGSetPlayerEquipmentLabel.appendChild(DEBUGSetPlayerEquipmentBtn);

  // give only bag item to player
  const DEBUGGivePlayerBagLabel = document.createElement("label");
  DEBUGGivePlayerBagLabel.classList.add("DEBUG_Label");
  DEBUGGivePlayerBagLabel.innerText = "Give player a bag";
  const DEBUGGivePlayerBagBtn = document.createElement("button");
  DEBUGGivePlayerBagBtn.innerText = "Give player a bag";
  DEBUGGivePlayerBagLabel.appendChild(DEBUGGivePlayerBagBtn);

  // set players' skills
  const DEBUGSetPlayerSkillsLabel = document.createElement("label");
  DEBUGSetPlayerSkillsLabel.classList.add("DEBUG_Label");
  DEBUGSetPlayerSkillsLabel.innerText = "Set player skills";

  const DEBUGSetPlayerSkillsSelect = document.createElement("select");

  const DEBUGSetPlayerSkillsNoob = document.createElement("option");
  DEBUGSetPlayerSkillsNoob.innerText = "Noob";
  DEBUGSetPlayerSkillsNoob.value = LEVEL_TYPES.NOOB;
  const DEBUGSetPlayerSkillsRegular = document.createElement("option");
  DEBUGSetPlayerSkillsRegular.innerText = "Regular";
  DEBUGSetPlayerSkillsRegular.value = LEVEL_TYPES.REGULAR;
  const DEBUGSetPlayerSkillsExpert = document.createElement("option");
  DEBUGSetPlayerSkillsExpert.innerText = "Expert";
  DEBUGSetPlayerSkillsExpert.value = LEVEL_TYPES.EXPERT;

  const DEBUGSetPlayerSkillsBtn = document.createElement("button");
  DEBUGSetPlayerSkillsBtn.innerText = "Set skills";
  DEBUGSetPlayerSkillsSelect.appendChild(DEBUGSetPlayerSkillsNoob);
  DEBUGSetPlayerSkillsSelect.appendChild(DEBUGSetPlayerSkillsRegular);
  DEBUGSetPlayerSkillsSelect.appendChild(DEBUGSetPlayerSkillsExpert);
  DEBUGSetPlayerSkillsLabel.appendChild(DEBUGSetPlayerSkillsSelect);
  DEBUGSetPlayerSkillsLabel.appendChild(DEBUGSetPlayerSkillsBtn);

  // toggle objects hit area
  const DEBUGHitAreaLabel = document.createElement("label");
  DEBUGHitAreaLabel.classList.add("DEBUG_Label");
  DEBUGHitAreaLabel.innerText = "Show hit area of objects";
  const DEBUGHitAreaCheckbox = document.createElement("input");
  DEBUGHitAreaCheckbox.type = "checkbox";
  DEBUGHitAreaLabel.appendChild(DEBUGHitAreaCheckbox);

  // set players speed
  const DEBUGSetPlayerSpeedLabel = document.createElement("label");
  DEBUGSetPlayerSpeedLabel.classList.add("DEBUG_Label");
  DEBUGSetPlayerSpeedLabel.innerText = "Set player speed";
  const DEBUGSetPlayerSpeedSelect = document.createElement("select");
  // options
  const DEBUGSetPlayerSpeedDefault = document.createElement("option");
  DEBUGSetPlayerSpeedDefault.innerText = "default";
  DEBUGSetPlayerSpeedDefault.value = DEBUG_PLAYER_SPEEDS_KEYS.SPEED_DEFAULT;
  const DEBUGSetPlayerSpeed4 = document.createElement("option");
  DEBUGSetPlayerSpeed4.innerText = "x2";
  DEBUGSetPlayerSpeed4.value = DEBUG_PLAYER_SPEEDS_KEYS.SPEED_X2;
  const DEBUGSetPlayerSpeed8 = document.createElement("option");
  DEBUGSetPlayerSpeed8.innerText = "x4";
  // button
  DEBUGSetPlayerSpeed8.value = DEBUG_PLAYER_SPEEDS_KEYS.SPEED_X4;
  const DEBUGSetPlayerSpeedBtn = document.createElement("button");
  DEBUGSetPlayerSpeedBtn.innerText = "Set speed";
  // append
  DEBUGSetPlayerSpeedSelect.appendChild(DEBUGSetPlayerSpeedDefault);
  DEBUGSetPlayerSpeedSelect.appendChild(DEBUGSetPlayerSpeed4);
  DEBUGSetPlayerSpeedSelect.appendChild(DEBUGSetPlayerSpeed8);
  DEBUGSetPlayerSpeedLabel.appendChild(DEBUGSetPlayerSpeedSelect);
  DEBUGSetPlayerSpeedLabel.appendChild(DEBUGSetPlayerSpeedBtn);

  // set teleport areas
  const DEBUGTeleportToAreaLabel = document.createElement("label");
  DEBUGTeleportToAreaLabel.classList.add("DEBUG_Label");
  DEBUGTeleportToAreaLabel.innerText = "Teleport to";
  const DEBUGTeleportToAreaSelect = document.createElement("select");

  // options
  Object.keys(DEBUG_PLAYER_TELEPORT_KEYS).forEach((key) => {
    const DEBUGTeleportOption = document.createElement("option");
    DEBUGTeleportOption.innerText = key;
    DEBUGTeleportOption.value = key;

    DEBUGTeleportToAreaSelect.appendChild(DEBUGTeleportOption);
  });

  // button
  const DEBUGTeleportToAreaBtn = document.createElement("button");
  DEBUGTeleportToAreaBtn.innerText = "Teleport";

  // append
  DEBUGTeleportToAreaLabel.appendChild(DEBUGTeleportToAreaSelect);
  DEBUGTeleportToAreaLabel.appendChild(DEBUGTeleportToAreaBtn);

  // append fields to fieldset
  DEBUGFieldset.appendChild(DEBUGClearPlayerItemsLabel);
  DEBUGFieldset.appendChild(DEBUGSetPlayerEquipmentLabel);
  DEBUGFieldset.appendChild(DEBUGSetPlayerSkillsLabel);
  DEBUGFieldset.appendChild(DEBUGGivePlayerBagLabel);
  DEBUGFieldset.appendChild(DEBUGHitAreaLabel);
  DEBUGFieldset.appendChild(DEBUGSetPlayerSpeedLabel);
  DEBUGFieldset.appendChild(DEBUGTeleportToAreaLabel);

  // append fieldset to content
  DEBUGContent.appendChild(DEBUGFieldset);
  DEBUGFieldset.appendChild(DEBUGFieldsetLegend);

  // append menu to document
  document.body.appendChild(DEBUGContainer);
  DEBUGContainer.appendChild(DEBUGToggleBtn);
  DEBUGContainer.appendChild(DEBUGContent);

  DEBUGToggleBtn.onclick = () => {
    DEBUGContainer.classList.toggle("show");
  };

  // handle events
  DEBUGClearPlayerItemsBtn.onclick = () => {
    window.e2e.clearPlayerItems(game.mainPlayerName);
  };

  DEBUGGivePlayerBagBtn.onclick = () => {
    window.e2e.givePlayerABag(game.mainPlayerName);
  };

  DEBUGSetPlayerEquipmentBtn.onclick = () => {
    window.e2e.setPlayerItems(
      game.mainPlayerName,
      DEBUGSetPlayerEquipmentSelect.value
    );
  };

  DEBUGSetPlayerSkillsBtn.onclick = () => {
    window.e2e.setPlayerSkills(
      game.mainPlayerName,
      DEBUGSetPlayerSkillsSelect.value
    );
  };

  DEBUGHitAreaCheckbox.onchange = () => {
    game.gameObjects.forEach((obj) => {
      if (DEBUGHitAreaCheckbox.checked) {
        game.input.enableDebug(obj);
      } else {
        game.input.removeDebug(obj);
      }
    });
  };

  DEBUGSetPlayerSpeedBtn.onclick = () => {
    window.e2e.setPlayerSpeed(
      game.mainPlayerName,
      DEBUGSetPlayerSpeedSelect.value
    );
  };

  DEBUGTeleportToAreaBtn.onclick = () => {
    window.e2e.teleportTo(game.mainPlayerName, DEBUGTeleportToAreaSelect.value);
  };
};
