import PF from "pathfinding";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import { HP_MAX, Player } from "../gameObjects/creatures/Player.mjs";
import { directions, getDirection } from "../utils/directions.mjs";
import {
  getAllies,
  getAttack,
  getDefenseValue,
  getHitValue,
  getRandomTile,
  getSelectedObject,
  isPlayerInHealingArea,
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
import { BUFF_TYPES } from "../../shared/buffs/Buff.mjs";
import { addLootingBagAfterPlayerIsDead } from "../../shared/gameObjects/index.mjs";
import { PLAYER_STATES } from "../../shared/constants/index.mjs";

const SI = new SnapshotInterpolation();

const grid = new PF.Grid(map);

const finder = new PF.AStarFinder({
  allowDiagonal: true,
});

let tick = 0;

const loop = ({ gameObjects, healingStones, io, players }) => {
  players.forEach((player) => {
    let selectedObject = getSelectedObject({
      players,
      gameObjects,
      selectedObjectName: player.selectedObjectName,
    });

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

          if (selectedObject?.type === "LootingBag") {
            io.to(player.socketId).emit(
              "dialog:looting-bag:show",
              selectedObject.items
            );
          }
        }
      } else {
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
            !selectedObject ||
            (selectedObject && player.settings.follow) ||
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

    player.getState(players, map);

    if (player.state === PLAYER_STATES.FIGHTING && player.fightingHook) {
      player.fightingHook({ finder, map, selectedObject, PF });
    }

    selectedObject = getSelectedObject({
      players,
      gameObjects,
      selectedObjectName: player.selectedObjectName,
    });

    if (selectedObject) {
      if (player.settings.follow) {
        player.updateFollowing(map, players, gameObjects);
      }

      if (player.dest === null) {
        player.direction = getDirection(
          player.positionTile,
          selectedObject.positionTile
        );

        player.isWalking = false;
      }

      if (
        player.settings.fight &&
        player.canAttack({ finder, map, selectedObject, PF })
      ) {
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
            player.afterAttackHook(players);
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
          player.selectedObjectName = null;
          player.selectedObjectTile = null;

          if (player.constructor.TYPE === Player.TYPE) {
            io.to(player.socketId).emit("player:selection:drop");
          }

          addLootingBagAfterPlayerIsDead({
            gameObjects,
            selectedObject,
            io,
          });
        }

        io.to(player.socketId).emit("player:energy:update", player.energy);
      }
    }

    if (player.next === null) {
      if (player.dropSelection) {
        player.dropSelection = false;
        player.dest = null;
        player.selectedObjectName = null;
        player.selectedObjectTile = null;
        player.isWalking = false;
      }
      if (player.speedToBeSet) {
        player.setSpeed(player.speedToBeSet);
      }
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
        } else if (selectedObject) {
          // getting resources action
          item = selectedObject.item;
          skillDetails = selectedObject.skill;
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
            (b) => b.name === player.settings.respawnBuilding
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
        player.selectedObjectName = null;
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

          let buffResult;

          if (buff.effect) {
            buffResult = buff.effect(players);
          }

          if (buff.resultType === BUFF_TYPES.HIT) {
            player.hit(buffResult.value);

            io.emit("player:attack-hit", {
              name: player.name,
              hitType: getHitText(buffResult.value),
              effectType: buffResult.type,
            });

            io.to(player.fraction).emit("players:hp:update", {
              players: getAllies(players, player.fraction),
            });

            if (player.isDead) {
              addLootingBagAfterPlayerIsDead({
                gameObjects,
                selectedObject: player,
                io,
              });
            }
          } else if (
            buff.resultType === BUFF_TYPES.DIZZY &&
            player.state !== PLAYER_STATES.DIZZY
          ) {
            player.setState(PLAYER_STATES.DIZZY);
          }
        }

        if (buff.durationTicks.value >= buff.durationTicks.maxValue) {
          buff.isFinished = true;

          if (player.state === PLAYER_STATES.DIZZY) {
            player.setState(player.defaultState);
          }

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
          isPlayerInHealingArea(healingStone.healingArea, player.positionTile)
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
        state: player.state,
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
