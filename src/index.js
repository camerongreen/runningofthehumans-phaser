let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0},
      debug: true
    }
  }
};

const SCENE_TITLE = "Title";
const SCENE_GAME = "Game";

let index = new Phaser.Game(config);

let gameScene = new GameScene(SCENE_GAME, config);
let titleScene = new TitleScene(SCENE_TITLE, config);

index.scene.add(SCENE_TITLE, titleScene, true);
index.scene.add(SCENE_GAME, gameScene, false);
