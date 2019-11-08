let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0}
    }
  }
};

const SCENE_TITLE = "Title";
const SCENE_GAME = "Game";

let game = new Phaser.Game(config);

let gameScene = new GameScene(SCENE_GAME, config);
let titleScene = new TitleScene(SCENE_TITLE, config);

game.scene.add(SCENE_TITLE, titleScene, true);
game.scene.add(SCENE_GAME, gameScene, false);
