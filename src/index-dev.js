import '../node_modules/phaser/dist/phaser.min.js';

import TitleScene from './TitleScene.js';
import GameScene from './GameScene.js';
import Env from './Env.js';

const env = new Env();

const config = {
  type: Phaser.AUTO,
  scale: {
    parent: 'running-container',
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  assets: env.isDrupal() ? drupalSettings.running.assets : './assets',
};

const SCENE_TITLE = 'TitleScene';
const SCENE_GAME = 'GameScene';

const game = new Phaser.Game(config);

const gameScene = new GameScene(SCENE_GAME, config);
const titleScene = new TitleScene(SCENE_TITLE, config);

game.scene.add(SCENE_TITLE, titleScene, true);
game.scene.add(SCENE_GAME, gameScene, false);
