import { DEBUG_ITEMS_SETS_TYPES } from "../../shared/debugUtils/index.mjs";

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
  // clear player items
  const DEBUGClearPlayerItemsLabel = document.createElement("label");
  DEBUGClearPlayerItemsLabel.classList.add("DEBUG_Label");
  DEBUGClearPlayerItemsLabel.innerText = "Clear player items";
  const DEBUGClearPlayerItemsBtn = document.createElement("button");
  DEBUGClearPlayerItemsBtn.innerText = "Clear";
  DEBUGClearPlayerItemsLabel.appendChild(DEBUGClearPlayerItemsBtn);

  // set player equipment
  const DEBUGSetPlayerEquipmentLabel = document.createElement("label");
  DEBUGSetPlayerEquipmentLabel.classList.add("DEBUG_Label");
  DEBUGSetPlayerEquipmentLabel.innerText = "Set player items";
  const DEBUGSetPlayerEquipmentSelect = document.createElement("select");
  const DEBUGSetPlayerEquipmentBasic = document.createElement("option");
  DEBUGSetPlayerEquipmentBasic.innerText = "Basic warrior";
  DEBUGSetPlayerEquipmentBasic.value = DEBUG_ITEMS_SETS_TYPES.WARRIOR_BASIC;
  const DEBUGSetPlayerEquipmentPro = document.createElement("option");
  DEBUGSetPlayerEquipmentPro.innerText = "Pro warrior";
  DEBUGSetPlayerEquipmentPro.value = DEBUG_ITEMS_SETS_TYPES.WARRIOR_PRO;
  const DEBUGSetPlayerEquipmentBtn = document.createElement("button");
  DEBUGSetPlayerEquipmentBtn.innerText = "Set items";
  DEBUGSetPlayerEquipmentSelect.appendChild(DEBUGSetPlayerEquipmentBasic);
  DEBUGSetPlayerEquipmentSelect.appendChild(DEBUGSetPlayerEquipmentPro);
  DEBUGSetPlayerEquipmentLabel.appendChild(DEBUGSetPlayerEquipmentSelect);
  DEBUGSetPlayerEquipmentLabel.appendChild(DEBUGSetPlayerEquipmentBtn);

  // give only bag item to player
  const DEBUGGivePlayerBagLabel = document.createElement("label");
  DEBUGGivePlayerBagLabel.classList.add("DEBUG_Label");
  DEBUGGivePlayerBagLabel.innerText = "Give player a bag";
  const DEBUGGivePlayerBagBtn = document.createElement("button");
  DEBUGGivePlayerBagBtn.innerText = "Give player a bag";
  DEBUGGivePlayerBagLabel.appendChild(DEBUGGivePlayerBagBtn);

  // toggle objects hit area
  const DEBUGHitAreaLabel = document.createElement("label");
  DEBUGHitAreaLabel.classList.add("DEBUG_Label");
  DEBUGHitAreaLabel.innerText = "Show hit area of objects";
  const DEBUGHitAreaCheckbox = document.createElement("input");
  DEBUGHitAreaCheckbox.type = "checkbox";
  DEBUGHitAreaLabel.appendChild(DEBUGHitAreaCheckbox);

  // append fields to fieldset
  DEBUGFieldset.appendChild(DEBUGClearPlayerItemsLabel);
  DEBUGFieldset.appendChild(DEBUGSetPlayerEquipmentLabel);
  DEBUGFieldset.appendChild(DEBUGGivePlayerBagLabel);
  DEBUGFieldset.appendChild(DEBUGHitAreaLabel);

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

  DEBUGHitAreaCheckbox.onchange = () => {
    game.input._list.forEach((obj) => { // eslint-disable-line
      if (DEBUGHitAreaCheckbox.checked) {
        game.input.enableDebug(obj);
      } else {
        game.input.removeDebug(obj);
      }
    });
  };
};
