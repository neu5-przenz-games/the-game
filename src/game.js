import Phaser from 'phaser'

import Game from './scenes/Game';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: 0
        }
    },
    scene: [Game]
};

export default new Phaser.Game(config);