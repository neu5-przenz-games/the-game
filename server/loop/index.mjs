import PF from "pathfinding";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import { HP_MAX } from "../gameObjects/Player.mjs";
import { directions, getDirection } from "../utils/directions.mjs";
import {
  getAllies,
  getAttack,
  getDefenseValue,
  getHitValue,
  getRespawnTile,
} from "../utils/algo.mjs";
import { getHitText } from "../utils/hitText.mjs";

import map from "../../public/assets/map/map.mjs";

import { getCurrentWeapon } from "../../shared/init/gameItems/index.mjs";
import {
  getLevel,
  shapeSkillsForClient,
  skillIncrease,
} from "../../shared/skills/index.mjs";
import { ATTACK_TYPES } from "../../shared/attackTypes/index.mjs";
import { MESSAGES_TYPES } from "../../shared/UIMessages/index.mjs";
import { LootingBag } from "../../shared/gameObjects/index.mjs";

const SI = new SnapshotInterpolation();

const grid = new PF.Grid(map);

const finder = new PF.AStarFinder({
  allowDiagonal: true,
});

let tick = 0;

const loop = ({ gameObjects, healingStones, io, players }) => {
  players.forEach((player) => {
    // Destination is set
    if (player.dest !== null) {
      // Next tile is set
      if (player.next !== null) {
        player.x += directions[player.direction].x * player.speed;
        player.y += directions[player.direction].y * player.speed;

        if (player.x === player.next.x && player.y === player.next.y) {
          player.next = null;
        }

        // player has reached its destination
        if (player.x === player.dest.x && player.y === player.dest.y) {
          player.dest = null;
          player.isWalking = false;

          if (player.selectedPlayer?.type === "LootingBag") {
            io.to(player.socketId).emit(
              "looting-bag:show",
              player.selectedPlayer.items
            );
          }
        }
      } else {
        if (player.dropSelection) {
          player.dropSelection = false;
          player.dest = null;
          player.selectedPlayer = null;
          player.selectedPlayerTile = null;
          player.isWalking = false;

          return;
        }

        const tempGrid = grid.clone();

        // add current players positions to the map grid
        players.forEach((pl) =>
          tempGrid.setWalkableAt(
            pl.positionTile.tileX,
            pl.positionTile.tileY,
            false
          )
        );

        const path = finder.findPath(
          player.positionTile.tileX,
          player.positionTile.tileY,
          player.dest.tile.tileX,
          player.dest.tile.tileY,
          tempGrid
        );

        if (path[1]) {
          const [x, y] = path[1];

          player.direction = getDirection(player.positionTile, {
            tileX: x,
            tileY: y,
          });

          if (
            player.selectedPlayer === null ||
            (player.selectedPlayer && player.settings.follow) ||
            player.settings.keepSelectionOnMovement
          ) {
            player.next = {
              x: player.x + directions[player.direction].nextX,
              y: player.y + directions[player.direction].nextY,
              tile: { tileX: x, tileY: y },
            };
            player.positionTile = player.next.tile;

            player.isWalking = true;
            player.x += directions[player.direction].x * player.speed;
            player.y += directions[player.direction].y * player.speed;
          }
        } else {
          // player can't go there
          player.dest = null;
        }
      }
    }

    const { selectedPlayer } = player;

    if (selectedPlayer) {
      if (player.settings.follow) {
        player.updateFollowing(map, players);
      }

      if (player.dest === null) {
        player.direction = getDirection(
          player.positionTile,
          selectedPlayer.positionTile
        );
      }

      if (player.settings.fight && player.canAttack({ finder, map, PF })) {
        player.attackDelayTicks = 0;
        player.attack = selectedPlayer.name;

        const currentWeapon = getCurrentWeapon(player.equipment.weapon);

        const weaponSkill = currentWeapon.skillToIncrease.name;
        const skillLevelName = getLevel(player.skills[weaponSkill].points).name;

        const attack = getAttack({
          currentWeapon,
          player,
          skillLevelName,
          selectedPlayer,
        });

        if (attack.type === ATTACK_TYPES.MISS) {
          io.emit("player:attack-missed", {
            name: selectedPlayer.name,
            message: MESSAGES_TYPES.ATTACK_MISSED,
          });
        } else if (attack.type === ATTACK_TYPES.PARRY) {
          io.emit("player:attack-parried", {
            name: selectedPlayer.name,
            message: MESSAGES_TYPES.ATTACK_PARRIED,
          });
          selectedPlayer.isParrying = true;
        } else if (attack.type === ATTACK_TYPES.HIT) {
          const defenseValue = getDefenseValue(selectedPlayer.equipment);

          const hit = getHitValue(attack.value, defenseValue);

          selectedPlayer.hit(hit);

          io.emit("player:attack-hit", {
            name: selectedPlayer.name,
            hitType: getHitText(hit),
          });

          io.to(selectedPlayer.fraction).emit("players:hp:update", {
            players: getAllies(players, selectedPlayer.fraction),
          });
        }

        player.energyUse(currentWeapon.details.energyCost);

        const skillDetails = currentWeapon.skillToIncrease;

        player.skillUpdate(skillIncrease(player.skills, skillDetails));

        io.to(player.socketId).emit(
          "skills:update",
          shapeSkillsForClient(player.skills)
        );

        if (selectedPlayer.equipment.shield) {
          const selectedPlayerSkillDetails = getCurrentWeapon(
            selectedPlayer.equipment.shield
          ).skillToIncrease;

          selectedPlayer.skillUpdate(
            skillIncrease(selectedPlayer.skills, selectedPlayerSkillDetails)
          );

          io.to(selectedPlayer.socketId).emit(
            "skills:update",
            shapeSkillsForClient(selectedPlayer.skills)
          );
        }

        if (player.hasRangedWeapon() && player.useArrow()) {
          io.to(player.socketId).emit(
            "items:update",
            player.backpack,
            player.equipment
          );
        }

        if (selectedPlayer.isDead) {
          selectedPlayer.dest = null;
          selectedPlayer.next = null;
          selectedPlayer.isWalking = false;

          const lootingBag = gameObjects.find(
            (go) =>
              go.name ===
              `LootingBag${selectedPlayer.positionTile.tileX}x${selectedPlayer.positionTile.tileY}`
          );

          if (selectedPlayer.hasItems()) {
            if (lootingBag) {
              const currentItems = [...lootingBag.items];

              gameObjects.splice(
                gameObjects.findIndex(
                  (go) =>
                    go.name ===
                    `LootingBag${selectedPlayer.positionTile.tileX}x${selectedPlayer.positionTile.tileY}`
                ),
                1,
                new LootingBag({
                  name: `LootingBag${selectedPlayer.positionTile.tileX}x${selectedPlayer.positionTile.tileY}`,
                  positionTile: {
                    tileX: selectedPlayer.positionTile.tileX,
                    tileY: selectedPlayer.positionTile.tileY,
                  },
                  items: [
                    ...currentItems,
                    ...selectedPlayer.backpack.items,
                    ...Object.values(selectedPlayer.equipment),
                  ],
                })
              );
            } else {
              const items = [
                ...selectedPlayer.backpack.items,
                ...Object.values(selectedPlayer.equipment),
              ];

              selectedPlayer.setBackpack();
              selectedPlayer.setEquipment();

              gameObjects.push(
                new LootingBag({
                  name: `LootingBag${selectedPlayer.positionTile.tileX}x${selectedPlayer.positionTile.tileY}`,
                  positionTile: {
                    tileX: selectedPlayer.positionTile.tileX,
                    tileY: selectedPlayer.positionTile.tileY,
                  },
                  items,
                })
              );
            }

            const lootingBags = gameObjects.reduce((res, go) => {
              if (go.type === "LootingBag") {
                res.push(go);
              }

              return res;
            }, []);

            io.emit(
              "looting-bag:list",
              lootingBags.map(({ name, positionTile, items }) => ({
                id: name,
                positionTile,
                items,
              }))
            );
          }

          io.to(selectedPlayer.socketId).emit(
            "items:update",
            selectedPlayer.backpack,
            selectedPlayer.equipment
          );

          io.to(selectedPlayer.socketId).emit(
            "player:dead",
            selectedPlayer.name
          );
        }
        io.to(player.socketId).emit("player:energy:update", player.energy);
      }
    } else if (player.dropSelection) {
      player.dropSelection = false;
      player.selectedPlayer = null;
      player.selectedPlayerTile = null;
    }

    if (player.toRespawn) {
      const respawnTile = getRespawnTile({
        map,
        obj: gameObjects.find(
          (b) => b.name === player.settings.respawnBuilding.name
        ),
        players,
        sizeToIncrease: {
          x: 2,
          y: 2,
        },
      });

      if (respawnTile) {
        player.respawn(respawnTile);
        io.to(player.socketId).emit("player:energy:update", player.energy);
        io.to(player.fraction).emit("players:hp:update", {
          players: getAllies(players, player.fraction),
        });
      } else {
        // fallback for no place to respawn
      }
    }

    if (player.energyRegenerate()) {
      io.to(player.socketId).emit("player:energy:update", player.energy);
    }

    if (player.attackDelayTicks < player.attackDelayMaxTicks) {
      player.attackDelayTicks += 1;
    }
    if (player.energyRegenDelayTicks < player.energyRegenDelayMaxTicks) {
      player.energyRegenDelayTicks += 1;
    }

    if (
      Number.isInteger(player.actionDurationTicks) &&
      player.actionDurationTicks < player.actionDurationMaxTicks
    ) {
      player.actionDurationTicks += 1;
    } else if (player.resetActionDuration()) {
      // action has ended
      io.to(player.socketId).emit("action:end");

      let item = null;
      let skillDetails = null;

      if (player.receipt) {
        // crafting action
        const { createdItem, skill } = player.receipt;

        item = { ...createdItem };
        skillDetails = { ...skill };
      } else if (player.selectedPlayer) {
        // getting resources action
        item = player.selectedPlayer.item;
        skillDetails = player.selectedPlayer.skill;
      }

      player.receipt = null;
      player.skillUpdate(skillIncrease(player.skills, skillDetails));

      io.to(player.socketId).emit(
        "skills:update",
        shapeSkillsForClient(player.skills)
      );

      if (item && player.addToBackpack([item])) {
        io.to(player.socketId).emit(
          "items:update",
          player.backpack,
          player.equipment
        );
      }
    }

    if (process.env.NODE_ENV === "development") {
      if (player.toKill) {
        player.toKill = false;
        player.hit(HP_MAX);
        io.to(player.socketId).emit("player:dead", player.name);
      }
    }
  });

  healingStones.forEach((healingStone) => {
    if (healingStone.healingDelayTicks >= healingStone.healingDelayMaxTicks) {
      players.forEach((player) => {
        if (
          !player.isDead &&
          healingStone.isPlayerInHealingArea(player.positionTile)
        ) {
          player.heal(healingStone.HP_REGEN_RATE);

          io.to(player.fraction).emit("players:hp:update", {
            playerName: player.name,
            players: getAllies(players, player.fraction),
          });
        }
      });

      healingStone.healingDelayTicks = 0;
    }

    if (healingStone.healingDelayTicks < healingStone.healingDelayMaxTicks) {
      healingStone.healingDelayTicks += 1;
    }
  });

  if (tick % 4 === 0) {
    tick = 0;

    const worldState = [];
    players.forEach((player) => {
      worldState.push({
        id: player.name,
        weapon: player.equipment.weapon || {},
        isWalking: player.isWalking,
        isDead: player.isDead,
        isParrying: player.isParrying,
        attack: player.attack,
        x: player.x,
        y: player.y,
        destTile: player.dest && player.dest.tile,
        direction: player.direction,
      });
      player.attack = null;
      player.isParrying = false;
    });

    const snapshot = SI.snapshot.create(worldState);
    SI.vault.add(snapshot);
    io.emit("players:update", snapshot);
  }

  tick += 1;
};

export { loop };
