const OFFSET_Y = 44;

export default ({ scene, x, y, depth, hitType }) => {
  const hitText = scene.add
    .text(x, y, hitType.text, {
      font: "12px Verdana",
      fill: hitType.color,
      stroke: "#333",
      strokeThickness: 1,
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
