/**
 * Handle the title scene in the game.
 */
export default class TitleScene extends Phaser.Scene {
  constructor(name, config) {
    super(name);
    this.config = config;

    this.bestTime = Number.MAX_SAFE_INTEGER;
    this.scoreText = null;
    this.space = null;
  }

  /**
   * Preload assets before scene begins.
   */
  preload() {
    this.load.image('bg', `${this.config.assets}/img/bg.png`);
    this.load.image('bull', `${this.config.assets}/img/bull.png`);
  }

  /**
   * Create most of the elements the scene uses.
   */
  create() {
    this.add.tileSprite(this.config.width / 2, this.config.height / 2, this.config.width, this.config.height, 'bg');
    this.physics.add.sprite(this.config.width / 2, this.config.height - 78, 'bull');

    const title = this.add.text(this.config.width / 2, this.config.height / 4, 'Running of the humans', {
      font: 'bold 50px Verdana',
      fill: '#F00',
      stroke: '#FFF',
      strokeThickness: 10,
    }).setOrigin(0.5);

    title.setShadow(3, 4, 'rgba(0,0,0,0.5', 5, true, false);

    const text = `
    Use your cursor keys [<- ->] to
    help the bull deal with drunken
    tourists in Pamplona, Spain. 
    
    Press [space] to start and pause.
    `;

    const instructions = this.add.text(this.config.width / 2, this.config.height / 2, text, {
      font: 'bold 28px Arial',
      fill: '#fff',
      align: 'center',
    }).setOrigin(0.5);

    instructions.setShadow(3, 4, 'rgba(0,0,0,0.5', 5);

    this.scoreText = this.add.text(this.config.width / 2, this.config.height / 1.2, '', {
      font: 'bold 28px Arial',
      fill: '#fff',
      align: 'center',
    }).setOrigin(0.5);

    this.scoreText.setShadow(3, 4, 'rgba(0,0,0,0.5', 5);

    this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.space.on('up', () => {
      const gs = this.scene.get('GameScene');
      gs.state = 'new';
      this.scene.switch('GameScene');
    });
  }

  /**
   * Sets the best time.
   *
   * Returns whether the input time is higher than the previous best time.
   * If it is the first time set though it retuns false.
   *
   * @param number time
   *   Time to check.
   * @returns boolean
   *   Is the input number higher than previous best time.
   *
   */
  setBestTime(time) {
    const previousBestTime = this.bestTime;
    if (time < this.bestTime) {
      this.bestTime = time;
      this.scoreText.setText(`Best time: ${time.toFixed(1)}`);

      if (previousBestTime !== Number.MAX_SAFE_INTEGER) {
        return true;
      }
    }

    return false;
  }
}
