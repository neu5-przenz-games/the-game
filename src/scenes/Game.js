import Phaser from 'phaser';
import io from 'socket.io-client';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }
    preload() {
        this.load.image('tileset', './assets/tileset/tileset.png');
        this.load.tilemapTiledJSON('map', './assets/map/map.json');
    }
    create() {
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tileset', 'tileset');
        map.createLayer('Ground', tileset);

        this.socket = io();
        this.stateStatus = null;
        this._playersNum = 0;
        this._players = {};

        this.socket.on("newPlayer", player => {
            let id = player.playerId;
            this.displayServerMessage("New player connected! " + id);
            this.updatePlayers(this._playersNum + 1);
            this._players[id] = {
                playerId: id
            };
        });
        this.socket.on("playerDisconnected", id => {
            this.displayServerMessage("Player has left: " + id);
            this.updatePlayers(this._playersNum - 1);
            delete this._players[id];
        });
        this.socket.on("currentPlayers", players => {
            let playerNum = Object.keys(players).length;
            this.displayServerMessage("Current players: " + playerNum);
            this.updatePlayers(playerNum);
            this._players = players;
        });

        this.cameras.main.fadeIn(250);
        this.stateStatus = 'playing';
    }
    updatePlayers(n) {
        this._playersNum = n;
    }
    displayServerMessage(msg) {
        var posX = 30;
        var posY = 150;
        var msg = this.add.text(posX, posY, 'server: ' + msg, { font: '22px ', fill: '#ffde00', stroke: '#000', strokeThickness: 3 });
        msg.setOrigin(0.0, 0.0);
        this.tweens.add({targets: msg, alpha: 0, y: posY-50, duration: 4000, ease: 'Linear'});
    }
};