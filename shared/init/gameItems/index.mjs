import { armors } from "./armor.mjs";
import { arrows } from "./arrows.mjs";
import { backpacks } from "./backpack.mjs";
import { boots } from "./boots.mjs";
import { helmets } from "./helmet.mjs";
import { pants } from "./pants.mjs";
import { quivers } from "./quiver.mjs";
import { resources } from "./resource.mjs";
import { shields } from "./shield.mjs";
import { fist, weapons } from "./weapon.mjs";

const gameItems = new Map();

armors.forEach((armor) => gameItems.set(armor.id, armor));
arrows.forEach((arrow) => gameItems.set(arrow.id, arrow));
backpacks.forEach((backpack) => gameItems.set(backpack.id, backpack));
boots.forEach((boot) => gameItems.set(boot.id, boot));
helmets.forEach((helmet) => gameItems.set(helmet.id, helmet));
pants.forEach((pant) => gameItems.set(pant.id, pant));
quivers.forEach((quiver) => gameItems.set(quiver.id, quiver));
resources.forEach((resource) => gameItems.set(resource.id, resource));
shields.forEach((shield) => gameItems.set(shield.id, shield));
weapons.forEach((weapon) => gameItems.set(weapon.id, weapon));

export const getCurrentWeapon = (item) =>
  item && item.id ? gameItems.get(item.id) : fist;

export { gameItems };
