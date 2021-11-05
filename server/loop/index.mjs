import PF from "pathfinding";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import { HP_MAX, Player } from "../gameObjects/Player.mjs";
import { PLAYER_STATES } from "../gameObjects/constants.mjs";
import { directions, getDirection } from "../utils/directions.mjs";
import {
  getAllies,
  getAttack,
  getDefenseValue,
  getHitValue,
  getRandomTile,
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
import { LootingBag, mergeItems } from "../../shared/gameObjects/index.mjs";

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

          if (player.selectedObject?.type === "LootingBag") {
            io.to(player.socketId).emit(
              "dialog:looting-bag:show",
              player.selectedObject.items
            );
          }
        }
      } else {
        if (player.dropSelection) {
          player.dropSelection = false;
          player.dest = null;
          player.selectedObject = null;
          player.selectedObjectTile = null;
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
            player.selectedObject === null ||
            (player.selectedObject && player.settings.follow) ||
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

    if (player.constructor.TYPE !== Player.TYPE) {
      player.getState(players, map);

      if (player.state === PLAYER_STATES.FIGHTING && player.fightingHook) {
        player.fightingHook({ finder, map, PF });
      }
    }

    const { selectedObject } = player;

    if (selectedObject) {
      if (player.settings.follow) {
        player.updateFollowing(map, players);
      }

      if (player.dest === null) {
        player.direction = getDirection(
          player.positionTile,
          selectedObject.positionTile
        );

        player.isWalking = false;
      }

      if (player.settings.fight && player.canAttack({ finder, map, PF })) {
        player.attackDelayTicks.value = 0;
        player.attack = selectedObject.name;

        const currentWeapon = getCurrentWeapon(player.equipment.weapon);

        const weaponSkill = currentWeapon.skillToIncrease.name;
        const skillLevelName = getLevel(player.skills[weaponSkill].points).name;

        const attack = getAttack({
          currentWeapon,
          player,
          skillLevelName,
          selectedObject,
        });

        if (attack.type === ATTACK_TYPES.MISS) {
          io.emit("player:attack-missed", {
            name: selectedObject.name,
            message: MESSAGES_TYPES.ATTACK_MISSED,
          });
        } else if (attack.type === ATTACK_TYPES.PARRY) {
          io.emit("player:attack-parried", {
            name: selectedObject.name,
            message: MESSAGES_TYPES.ATTACK_PARRIED,
          });
          selectedObject.isParrying = true;
        } else if (attack.type === ATTACK_TYPES.HIT) {
          const defenseValue = getDefenseValue(selectedObject.equipment);

          const hit = getHitValue(attack.value, defenseValue);

          selectedObject.hit(hit);

          io.emit("player:attack-hit", {
            name: selectedObject.name,
            hitType: getHitText(hit),
          });

          io.to(selectedObject.fraction).emit("players:hp:update", {
            players: getAllies(players, selectedObject.fraction),
          });

          if (player.afterAttackHook) {
            player.afterAttackHook();
          }
        }

        if (player.constructor.TYPE === Player.TYPE) {
          player.energyUse(currentWeapon.details.energyCost);
        }

        const skillDetails = currentWeapon.skillToIncrease;

        player.skillUpdate(skillIncrease(player.skills, skillDetails));

        io.to(player.socketId).emit(
          "skills:update",
          shapeSkillsForClient(player.skills)
        );

        if (selectedObject.equipment.shield) {
          const selectedObjectSkillDetails = getCurrentWeapon(
            selectedObject.equipment.shield
          ).skillToIncrease;

          selectedObject.skillUpdate(
            skillIncrease(selectedObject.skills, selectedObjectSkillDetails)
          );

          io.to(selectedObject.socketId).emit(
            "skills:update",
            shapeSkillsForClient(selectedObject.skills)
          );
        }

        if (
          player.constructor.TYPE === Player.TYPE &&
          player.hasRangedWeapon() &&
          player.useArrow()
        ) {
          io.to(player.socketId).emit(
            "items:update",
            player.backpack,
            player.equipment
          );
        }

        if (selectedObject.isDead) {
          selectedObject.dest = null;
          selectedObject.next = null;
          selectedObject.isWalking = false;
          player.selectedObject = null;
          player.selectedObjectTile = null;

          if (player.constructor.TYPE === Player.TYPE) {
            io.to(player.socketId).emit("player:selection:drop");
          }

          const lootingBag = gameObjects.find(
            (go) =>
              go.name ===
              `LootingBag${selectedObject.positionTile.tileX}x${selectedObject.positionTile.tileY}`
          );

          if (selectedObject.hasItems()) {
            if (lootingBag) {
              const currentItems = [...lootingBag.items];

              gameObjects.splice(
                gameObjects.findIndex(
                  (go) =>
                    go.name ===
                    `LootingBag${selectedObject.positionTile.tileX}x${selectedObject.positionTile.tileY}`
                ),
                1,
                new LootingBag({
                  name: `LootingBag${selectedObject.positionTile.tileX}x${selectedObject.positionTile.tileY}`,
                  positionTile: {
                    tileX: selectedObject.positionTile.tileX,
                    tileY: selectedObject.positionTile.tileY,
                  },
                  items: [
                    ...currentItems,
                    ...selectedObject.backpack.items,
                    ...Object.values(selectedObject.equipment),
                  ].reduce(mergeItems, []),
                })
              );
            } else {
              const items = [
                ...selectedObject.backpack.items,
                ...Object.values(selectedObject.equipment),
              ].reduce(mergeItems, []);

              selectedObject.setBackpack();
              selectedObject.setEquipment();

              gameObjects.push(
                new LootingBag({
                  name: `LootingBag${selectedObject.positionTile.tileX}x${selectedObject.positionTile.tileY}`,
                  positionTile: {
                    tileX: selectedObject.positionTile.tileX,
                    tileY: selectedObject.positionTile.tileY,
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

          io.to(selectedObject.socketId).emit(
            "items:update",
            selectedObject.backpack,
            selectedObject.equipment
          );

          io.to(selectedObject.socketId).emit(
            "player:dead",
            selectedObject.name
          );
        }
        io.to(player.socketId).emit("player:energy:update", player.energy);
      }
    } else if (player.dropSelection) {
      player.dropSelection = false;
      player.selectedObject = null;
      player.selectedObjectTile = null;
    }

    if (player.attackDelayTicks.value < player.attackDelayTicks.maxValue) {
      player.attackDelayTicks.value += 1;
    }

    if (player.constructor.TYPE === Player.TYPE) {
      if (player.energyRegenerate()) {
        io.to(player.socketId).emit("player:energy:update", player.energy);
      }
      if (
        player.energyRegenDelayTicks.value <
        player.energyRegenDelayTicks.maxValue
      ) {
        player.energyRegenDelayTicks.value += 1;
      }

      if (
        player.actionDurationTicks !== null &&
        player.actionDurationTicks.value < player.actionDurationTicks.maxValue
      ) {
        player.actionDurationTicks.value += 1;
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
        } else if (player.selectedObject) {
          // getting resources action
          item = player.selectedObject.item;
          skillDetails = player.selectedObject.skill;
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

      if (player.toRespawn) {
        const respawnTile = getRandomTile({
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
    } else if (player.constructor.TYPE !== Player.TYPE) {
      if (
        player.isDead &&
        player.respawnDelayTicks.value < player.respawnDelayTicks.maxValue
      ) {
        player.respawnDelayTicks.value += 1;
      }

      if (player.respawnDelayTicks.value >= player.respawnDelayTicks.maxValue) {
        player.toRespawn = true;
      }

      if (player.toRespawn) {
        player.setDefaultEquipment();
        player.dest = null;
        player.selectedObject = null;
        player.selectedObjectTile = null;

        const respawnTile = getRandomTile({
          map,
          obj: {
            positionTile: player.presenceAreaCenterTile,
            size: player.size,
          },
          players,
          sizeToIncrease: {
            x: 2,
            y: 2,
          },
        });

        if (respawnTile) {
          player.respawn(respawnTile);
        } else {
          // fallback for no place to respawn
        }
      }
    }

    if (player.buffs.length) {
      player.buffs.forEach((buff) => {
        if (
          buff.occurrencesIntervalTicks.value >=
          buff.occurrencesIntervalTicks.maxValue
        ) {
          buff.occurrencesIntervalTicks.value = 0;

          const buffResult = buff.effect(players);

          if (buffResult.type === "HIT") {
            const buffedPlayer = players.get(buff.selectedObjectName);

            buffedPlayer.hit(buffResult.value);

            io.emit("player:attack-hit", {
              name: buffedPlayer.name,
              hitType: getHitText(buffResult.value),
              effectType: "fire",
            });

            io.to(buffedPlayer.fraction).emit("players:hp:update", {
              players: getAllies(players, buffedPlayer.fraction),
            });

            if (buffedPlayer.isDead) {
              io.to(buffedPlayer.socketId).emit(
                "player:dead",
                buffedPlayer.name
              );
            }
          }
        }

        if (buff.durationTicks.value >= buff.durationTicks.maxValue) {
          buff.isFinished = true;
          return;
        }

        buff.durationTicks.value += 1;
        buff.occurrencesIntervalTicks.value += 1;
      });

      player.buffs = player.buffs.filter((buff) => !buff.isFinished);
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
    if (
      healingStone.healingDelayTicks.value >=
      healingStone.healingDelayTicks.maxValue
    ) {
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

      healingStone.healingDelayTicks.value = 0;
    }

    if (
      healingStone.healingDelayTicks.value <
      healingStone.healingDelayTicks.maxValue
    ) {
      healingStone.healingDelayTicks.value += 1;
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
