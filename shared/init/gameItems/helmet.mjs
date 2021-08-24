import { Helmet } from "../../gameItems/index.mjs";

export const hat = new Helmet({
  id: "hat",
  displayName: "Hat",
  imgURL: "hat.png",
});

export const frozenHelmet = new Helmet({
  id: "frozenHelmet",
  displayName: "Frozen helmet",
  imgURL: "frozen_helmet.png",
});

export const helmets = [hat, frozenHelmet];
