import { UIDialogWrapper } from "../wrapper/wrapper.mjs";
import { createBtn } from "../../../utils/index.mjs";
import { OFFSET } from "../../../../gameObjects/Creatures/Player.mjs";

const ACTIONS = {
  CANCEL: "CANCEL",
};

const DIALOG_WIDTH = window.innerWidth > 1366 ? 0.8 : 1;
const POINTER_WIDTH = 14;
const POINTER_HEIGHT = 18;

const getPointerPosition = ({ x, y, width }) => {
  const widthRatio = (window.innerWidth * DIALOG_WIDTH) / width;

  return {
    top: Math.ceil(widthRatio * (y - OFFSET.Y) - POINTER_WIDTH / 2),
    /* isometric map in Phaser has (0,0) point at the top center
     * but HTML image has (0,0) point at top left
     * so to make it align we need to add half of the width to the x
     */
    left: Math.ceil(
      widthRatio * (x - OFFSET.X + width / 2) - POINTER_HEIGHT / 2
    ),
  };
};

const getFooter = () => {
  const fragment = new DocumentFragment();

  const closeBtn = createBtn({
    datasets: [{ name: "action", value: ACTIONS.CANCEL }],
    text: "Close",
  });

  fragment.appendChild(closeBtn);

  return fragment;
};

export class UIDialogMap extends UIDialogWrapper {
  setListeners() {
    this.dialog.onclick = (ev) => {
      const { action } = ev.target.dataset;

      if (action === ACTIONS.CANCEL) {
        super.close();
      }
    };
  }

  setGameType(gameType) {
    this.gameType = gameType;
  }

  getContent = ({ top, left }) => {
    const fragment = new DocumentFragment();

    const mapWrapper = document.createElement("div");
    mapWrapper.classList.add("map-wrapper");

    const mapImg = new Image();
    mapImg.classList.add("map-wrapper__map");
    mapImg.src = `./assets/map/image/${this.gameType}.png`;

    const playerPointer = document.createElement("div");
    playerPointer.classList.add("map-wrapper__player-pointer");

    playerPointer.style.top = top;
    playerPointer.style.left = left;

    mapWrapper.appendChild(mapImg);
    mapWrapper.appendChild(playerPointer);
    fragment.appendChild(mapWrapper);

    return fragment;
  };

  show({ x, y }, { width }) {
    this.setListeners();

    const content = this.getContent(getPointerPosition({ x, y, width }));
    const footer = getFooter();

    super.show({
      content,
      footer,
    });
  }
}
