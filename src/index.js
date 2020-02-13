import 'phaser';

import TitleScene from './TitleScene';
import GameScene from './GameScene';
import Env from './Env';

const env = new Env();

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'running-container',
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
