const HIT_TYPES = {
  NORMAL: {
    color: "#FFE62B",
    text: "got hit",
  },
  HARD: {
    color: "#FF942B",
    text: "that's hard!",
  },
  CRITICAL: {
    color: "#FF0000",
    text: "ohh my!!!",
  },
};

const getHitTextStyle = (value) => {
  if (value >= 40) {
    return HIT_TYPES.CRITICAL;
  }
  if (value >= 20) {
    return HIT_TYPES.HARD;
  }
  return HIT_TYPES.NORMAL;
};

const OFFSET_Y = 44;

export default ({ scene, x, y, depth, value }) => {
  const textStyle = getHitTextStyle(value);

  const hitText = scene.add
    .text(x, y, textStyle.text, {
      font: "12px Verdana",
      fill: textStyle.color,
    })
    .setOrigin(0.5, 2)
    .setPosition(x, y - OFFSET_Y);
  hitText.depth = depth;

  scene.tweens.add({
    targets: hitText,
    y: "-=50",
    ease: "Linear",
    duration: 2000,
    onComplete(tween, targets) {
      targets[0].destroy();
    },
  });
};
