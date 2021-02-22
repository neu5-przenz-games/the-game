class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }
    create() {
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tileset', 'tileset');
        map.createLayer('Ground', tileset);

        this.socket = io();
        this.stateStatus = null;
        this._playersNum = 0;
        this._players = {};
        
        this.initUI();

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

        this.input.keyboard.on('keydown', this.handleKey, this);
        this.cameras.main.fadeIn(250);
        this.stateStatus = 'playing';
    }
    handleKey(e) {
        switch(e.code) {
            case 'KeyB': {
                this.stateBack();
                break;
            }
            case 'KeyT': {
                this.stateRestart();
                break;
            }
            default: {}
        }
    }
    initUI() {
        var fontScore = { font: '38px '+EPT.text['FONT'], fill: '#ffde00', stroke: '#000', strokeThickness: 5 };
        this.textPlayers = this.add.text(EPT.world.width-210, EPT.world.height-30, 'Players: '+this._playersNum, fontScore);
        this.textPlayers.setOrigin(0,1);
        this.textPlayers.y = EPT.world.height+this.textPlayers.height+30;
        this.tweens.add({targets: this.textPlayers, y: EPT.world.height-30, duration: 500, ease: 'Back'});
    }
    updatePlayers(n) {
        this._playersNum = n;
        this.textPlayers.setText('Players: ' + this._playersNum);
    }
    displayServerMessage(msg) {
        var posX = 30;
        var posY = 150;
        var msg = this.add.text(posX, posY, 'server: ' + msg, { font: '22px '+EPT.text['FONT'], fill: '#ffde00', stroke: '#000', strokeThickness: 3 });
        msg.setOrigin(0.0, 0.0);
        this.tweens.add({targets: msg, alpha: 0, y: posY-50, duration: 4000, ease: 'Linear'});
    }
    stateRestart() {
        EPT.fadeOutScene('Game', this);
    }
    stateBack() {
        EPT.fadeOutScene('MainMenu', this);
    }
};