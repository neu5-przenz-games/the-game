import { Helmet } from "../../gameItems/index.mjs";

export const hat = new Helmet({
  id: "hat",
  displayName: "Hat",
  imgURL: "hat.png",
  details: {
    defence: 10,
  },
});

export const frozenHelmet = new Helmet({
  id: "frozenHelmet",
  displayName: "Frozen helmet",
  imgURL: "frozen_helmet.png",
  details: {
    defence: 100,
  },
});

export const helmets = [hat, frozenHelmet];
