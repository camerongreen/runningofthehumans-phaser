class PauseScene extends Phaser.Scene {
  #config = {};
  #space = null;

  constructor(name, config) {
    super(name);
    this.config = config;
  }

  create() {
    this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.space.on('up', () => {
      this.scene.switch(SCENE_GAME);
    });
  }

}
