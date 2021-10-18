import Phaser from "phaser";
import io from "socket.io-client";

import { MESSAGES } from "../../shared/UIMessages/index.mjs";
import { LootingBag } from "../gameObjects/LootingBag.mjs";
import { Skeleton } from "../gameObjects/Skeleton.mjs";
import { Mob } from "../gameObjects/Mob.mjs";
import { TextTween } from "../gameObjects/TextTween.mjs";
import { UIProfile } from "../ui/profile.mjs";
import { ParticleEmitter } from "../utils/index.mjs";
import { inputs } from "./inputs.mjs";

const displayServerMessage = (game, msgArg) => {
  game.chat.addServerMessage(msgArg);
};

export const sockets = (game) => {
  game.setSocket(io());

  game.socket.on("player:new", (newPlayer) => {
    displayServerMessage(game, `New player connected: ${newPlayer.name}`);
    game.playerList.playerActive(newPlayer.name);
  });

  game.socket.on("player:disconnected", (name) => {
    displayServerMessage(game, `Player has left: ${name}`);
    game.playerList.playerInactive(name);
  });

  const checkboxCb = ({ checkboxName, name, value }) => {
    game.socket.emit("settings:checkbox:set", {
      name,
      value,
      checkboxName,
    });
    game.settings[checkboxName] = value;
  };

  const respawnCb = (name) => {
    game.socket.emit("player:respawn", {
      name,
    });
    game.profile.toggleRespawnButton(false);
  };

  const dropSelectionCb = (name) => {
    game.socket.emit("player:selection:drop", {
      name,
    });
    game.resetSelectedObject();
  };

  const actionCb = (name) => {
    game.socket.emit("action:button:clicked", {
      name,
    });
  };

  const itemActionsCb = ({ name, actionName, itemName, equipmentItemType }) => {
    game.socket.emit("action:item", {
      name,
      actionName,
      itemName,
      equipmentItemType,
    });
  };

  const craftingCb = ({ id, name }) => {
    game.socket.emit("crafting:button:clicked", {
      id,
      name,
    });
  };

  const dialogCb = ({ socketName, ...props }) => {
    game.socket.emit(socketName, props);
  };

  game.socket.on("players:list", (players, socketId) => {
    game.setSocketId(socketId);

    game.setMainPlayerName(
      players.find((player) => player.socketId === game.socketId).name
    );

    game.playerList.rebuild(players);

    let equipment = null;
    let backpack = null;
    let crafting = null;
    let skills = null;

    game.setPlayers(
      players.map((player) => {
        let isMainPlayer = false;
        if (player.name === game.mainPlayerName) {
          isMainPlayer = true;

          game.setSettings(player.settings);

          equipment = player.equipment;
          backpack = player.backpack;
          crafting = player.crafting;
          skills = player.skills;
        }

        if (player.type === "Player") {
          const skeleton = game.add.existing(
            new Skeleton({
              direction: player.direction,
              isMainPlayer,
              energy: player.energy,
              isDead: player.isDead,
              name: player.name,
              displayName: player.displayName,
              fraction: player.fraction,
              scene: game,
              x: player.x,
              y: player.y,
            })
          );
          game.gameObjects.push(skeleton);

          return skeleton;
        }
        const mob = game.add.existing(
          new Mob({
            direction: player.direction,
            isDead: player.isDead,
            name: player.name,
            displayName: player.displayName,
            scene: game,
            x: player.x,
            y: player.y,
          })
        );
        game.gameObjects.push(mob);

        return mob;
      })
    );

    game.players.forEach((player) => {
      player.setInteractive(
        new Phaser.Geom.Rectangle(
          player.constructor.hitAreaSize.width / 2,
          player.constructor.hitAreaSize.height / 2,
          player.constructor.hitAreaSize.width,
          player.constructor.hitAreaSize.height
        ),
        Phaser.Geom.Rectangle.Contains
      );
    });

    const mainPlayer = game.players.get(game.mainPlayerName);
    game.setMainPlayer(mainPlayer);

    game.setProfile(
      new UIProfile({
        name: game.mainPlayerName,
        isDead: mainPlayer.isDead,
        equipment,
        settings: game.settings,
        crafting,
        skills,
        backpack,
        actionCb,
        checkboxCb,
        craftingCb,
        dropSelectionCb,
        itemActionsCb,
        respawnCb,
        game,
      })
    );

    game.cameras.main.startFollow(game.mainPlayer, true);

    inputs(game);
  });

  game.socket.on("players:update", (snapshot) => {
    game.SI.snapshot.add(snapshot);
  });

  game.socket.on("players:hp:update", ({ playerName, players }) => {
    if (playerName) {
      const player = game.players.get(playerName);

      const particle = new ParticleEmitter({ // eslint-disable-line
        scene: game,
        particleImgId: "particle-healing-green",
        particleScale: 0.3,
        x: player.x,
        y: player.y,
        objDepth: player.depth,
      });
    }

    players.forEach(({ name, hp }) => {
      const player = game.players.get(name);

      player.healthBar.show();
      player.healthBar.updateValue(hp);
    });
  });

  game.socket.on("player:attack-hit", ({ name, hitType }) => {
    const player = game.players.get(name);

    const particle = new ParticleEmitter({ // eslint-disable-line
      scene: game,
      particleImgId: "particle-red",
      particleScale: 0.5,
      x: player.x,
      y: player.y,
      objDepth: player.depth,
    });

    TextTween({
      scene: game,
      x: player.x,
      y: player.y,
      depth: player.depth,
      message: hitType.text,
      color: hitType.color,
    });
  });

  game.socket.on("player:attack-missed", ({ name, message }) => {
    const player = game.players.get(name);

    TextTween({
      scene: game,
      x: player.x,
      y: player.y,
      depth: player.depth,
      message: MESSAGES[message],
    });
  });

  game.socket.on("player:attack-parried", ({ name, message }) => {
    const player = game.players.get(name);

    TextTween({
      scene: game,
      x: player.x,
      y: player.y,
      depth: player.depth,
      message: MESSAGES[message],
    });
  });

  game.socket.on("player:dead", (name) => {
    const player = game.players.get(name);

    if (player.isMainPlayer) {
      game.profile.toggleRespawnButton(true);
      game.mainPlayer.actionEnd();
      game.resetSelectedObject();
    }
    displayServerMessage(game, `You are dead ☠`);
  });

  game.socket.on("player:energy:update", (value) => {
    game.mainPlayer.energyBar.updateValue(value);
  });

  game.socket.on("action:button:set", ({ name }) => {
    if (name) {
      game.profile.setActionButton(name);
    } else {
      game.profile.resetActionButton();
    }
  });

  game.socket.on("action:start", (duration) => {
    game.mainPlayer.actionStart(duration);
  });

  game.socket.on("action:end", () => {
    game.mainPlayer.actionEnd();
  });

  game.socket.on("action:rejected", (message) => {
    const player = game.mainPlayer;
    TextTween({
      scene: game,
      x: player.x,
      y: player.y,
      depth: player.depth,
      message: MESSAGES[message],
      duration: 3000,
    });
  });

  game.socket.on("crafting:rejected", (message) => {
    const player = game.mainPlayer;
    TextTween({
      scene: game,
      x: player.x,
      y: player.y,
      depth: player.depth,
      message: MESSAGES[message],
      duration: 3000,
    });
  });

  game.socket.on("items:update", (backpack, equipment) => {
    game.setBackpack(backpack);
    game.setEquipment(equipment);
  });

  game.socket.on("skills:update", (skills) => {
    game.setSkills(skills);
  });

  game.socket.on("skills:update", (skills) => {
    game.setSkills(skills);
  });

  game.socket.on("chat:message:add", (message, playerName) => {
    game.chat.addMessage(playerName, message);
  });

  game.socket.on("looting-bag:list", (lootingBags) => {
    game.gameObjects = game.gameObjects.reduce((gameObjects, gameObject) => {
      if (gameObject.constructor.TYPE === LootingBag.TYPE) {
        gameObject.destroy();
      } else {
        gameObjects.push(gameObject);
      }

      return gameObjects;
    }, []);

    lootingBags.forEach(({ id, positionTile }) => {
      const objectWorldXY = game.groundLayer.tileToWorldXY(
        positionTile.tileX,
        positionTile.tileY
      );

      const lootingBag = new LootingBag(
        game,
        objectWorldXY.x,
        objectWorldXY.y,
        "looting-bag",
        id
      );

      game.add.existing(lootingBag);

      lootingBag.setInteractive(
        new Phaser.Geom.Rectangle(
          0,
          0,
          lootingBag.constructor.hitAreaSize.width,
          lootingBag.constructor.hitAreaSize.height
        ),
        Phaser.Geom.Rectangle.Contains
      );

      game.gameObjects.push(lootingBag);
    });
  });

  game.socket.on("dialog:looting-bag:show", (items) => {
    game.profile.UIDialog.lootingBag.show({
      name: game.mainPlayerName,
      items,
      dialogCb,
    });
  });

  game.socket.on(
    "dialog:confirm-attack-ally:show",
    (selectedObjectDisplayName) => {
      game.profile.UIDialog.confirm.show({
        name: game.mainPlayerName,
        selectedObjectDisplayName,
        dialogCb,
      });
    }
  );

  game.socket.on("dialog:close", () => {
    game.profile.UIDialog.wrapper.close();
  });

  game.socket.on("dialog:looting-bag:close", () => {
    game.resetSelectedObject();

    game.profile.UIDialog.wrapper.close();
  });

  game.socket.on("connect", () => {
    displayServerMessage(game, `Connected to server`);
  });

  game.socket.on("disconnect", () => {
    displayServerMessage(game, `Disconnected from server`);
    game.removePlayers();
  });

  if (process.env.NODE_ENV === "development") {
    window.e2e = {
      ...window.e2e,
      killPlayer: (playerName) => {
        game.socket.emit("game:killPlayer", {
          name: playerName,
        });
      },
      clearPlayerItems: (playerName) => {
        game.socket.emit("player:items:clear", {
          name: playerName,
        });
      },
      givePlayerABag: (playerName) => {
        game.socket.emit("player:items:give-a-bag", {
          name: playerName,
        });
      },
      setPlayerItems: (playerName, itemsSetType) => {
        game.socket.emit("player:items:set", {
          name: playerName,
          itemsSetType,
        });
      },
      moveItemToBackpackFromEquipment: (playerName, itemID) => {
        game.socket.emit("player:items:move-to-backpack", {
          name: playerName,
          itemID,
        });
      },
      destroyItemFromBackpack: (playerName, itemID) => {
        game.socket.emit("player:items:destroy-from-backpack", {
          name: playerName,
          itemID,
        });
      },
      setPlayerSkills: (playerName, skillType) => {
        game.socket.emit("player:skills:set", {
          name: playerName,
          skillType,
        });
      },
    };
  }
};
