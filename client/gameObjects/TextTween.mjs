const OFFSET_Y = 44;

export const TextTween = ({
  scene,
  x,
  y,
  depth,
  message,
  color = "#fff",
  duration = 2000,
}) => {
  const text = scene.add
    .text(x, y, message, {
      font: "12px Verdana",
      fill: color,
      stroke: "#333",
      strokeThickness: 2,
    })
    .setOrigin(0.5, 2)
    .setPosition(x, y - OFFSET_Y);
  text.depth = depth;

  scene.tweens.add({
    targets: text,
    y: "-=50",
    ease: "Linear",
    duration,
    onComplete(tween, targets) {
      targets[0].destroy();
    },
  });
};
