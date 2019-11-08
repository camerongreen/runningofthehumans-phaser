class TitleScene extends Phaser.Scene {
  #config = {};
  #space = null;

  constructor(name, config) {
    super({key: name});
    this.config = config;
  }

  preload() {
    this.load.image('bg', 'assets/bg.png');
    this.load.image('bull', 'assets/bull.png');
  }

  create() {
    this.add.tileSprite(this.config.width / 2, this.config.height / 2, this.config.width, this.config.height, 'bg');
    this.physics.add.sprite(this.config.width / 2, this.config.height - 78, 'bull');

    let title = this.add.text(this.config.width / 2, this.config.height / 4, 'Running of the humans', {
      font: 'bold 50px Verdana',
      fill: '#F00',
      stroke: '#FFF',
      strokeThickness: 5,
    }).setOrigin(0.5);

    title.setShadow(3, 4, 'rgba(0,0,0,0.5', 5);

    const text = `
    Use your cursor keys to
    help the bull run over drunken
    tourists in Pamplona. 
    
    Press [space] to start and pause.
    `;

    this.add.text(this.config.width / 2, this.config.height / 2, text, {
      font: 'bold 28px Arial',
      fill: '#fff',
      align: "center",
    }).setOrigin(0.5);

    this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    if (this.space.isDown) {
      this.scene.switch(SCENE_GAME);
    }
  }
}
