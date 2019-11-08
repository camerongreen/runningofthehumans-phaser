const BOUNDS = 105;
const BULL_POSITIONX_SPEED = 20;
const RUNNERS_NUM = 5;
const SPEED_INCREMENT = 0.1;
const SPEED_MAX = 20;

class GameScene extends Phaser.Scene {
  #bull = null;
  #bull_positionX = null;
  #config = {};
  #cursors = null;
  #music = null;
  #missed = null;
  #ole = null;
  #runnerGroup = null;
  #score = 0;
  #scoreText = null;
  #speed = 0;
  #state = null;

  constructor(name, config) {
    super({key: name});
    this.config = config;
  }

  preload() {
    this.load.image('bg', 'assets/bg.png');
    this.load.image('bull', 'assets/bull.png');
    this.load.spritesheet('runner',
        'assets/runner.png',
        {frameWidth: 40, frameHeight: 40}
    );
    this.load.audio('missed', [
      'assets/missed.ogg',
      'assets/missed.mp3',
    ]);
    this.load.audio('music', [
      'assets/espana.ogg',
      'assets/espana.mp3',
    ]);
    this.load.audio('ole', [
      'assets/ole.ogg',
      'assets/ole.mp3',
    ]);
  }

  create() {
    this.missed = this.sound.add('missed');
    this.music = this.sound.add('music');
    this.ole = this.sound.add('ole');

    this.background = this.add.tileSprite(this.config.width / 2, this.config.height / 2, this.config.width, this.config.height, 'bg');

    this.scoreText = this.add.text(16, 16, 'score: 0', {
      fontSize: '32px',
      fill: '#000'
    });

    this.physics.world.setBounds(BOUNDS, 0, this.config.width - (2 * BOUNDS), this.config.height);

    this.bull = this.physics.add.sprite(this.config.width / 2, this.config.height - 78, 'bull');
    this.bull.setCollideWorldBounds(true);
    this.bull.body.onWorldBounds = true;
    this.physics.world.on('worldbounds', this.hitWorldBounds);

    this.anims.create({
      key: 'running',
      frames: this.anims.generateFrameNumbers('runner', {tart: 0, end: 5}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'caught',
      frames: [{key: 'runner', frame: 6}],
      frameRate: 20
    });

    this.anims.create({
      key: 'standing',
      frames: [{key: 'runner', frame: 0}],
      frameRate: 20
    });

    this.runnerGroup = this.physics.add.group({
      key: 'runner',
      repeat: RUNNERS_NUM - 1,
    });

    this.physics.add.overlap(this.bull, this.runnerGroup.getChildren(), this.gotRunner, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();

    let space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    space.on('up',  () => {
      switch (this.state) {
        case 'new':
          this.state = 'running';
          this.music.play();
          Phaser.Actions.Call(this.runnerGroup.getChildren(), runner => {
            runner.anims.play('running', true);
          }, this);
          break;
        case 'running':
          this.scene.pause(this.key);
          this.state = 'pause';
          Phaser.Actions.Call(this.runnerGroup.getChildren(), runner => {
            runner.anims.play('standing', true);
          }, this);
          break;
        case 'pause':
          this.scene.resume(this.key);
          this.state = 'running';
          Phaser.Actions.Call(this.runnerGroup.getChildren(), runner => {
            runner.anims.play('running', true);
          }, this);
          break;
        case 'ended':
          this.start();
          this.music.stop();
          this.scene.switch(SCENE_TITLE);
          break;
      }
    });

    this.start();
  }

  hitWorldBounds(body) {
    this.bull_positionX = 0;
    body.setVelocityX(0);
  }

  gotRunner(bull, runner) {
    if (!runner.caught) {
      this.ole.play();
      runner.anims.play('caught', true);
      this.score += 1;
      this.scoreText.setText('Score:' + this.score);
      runner.caught = true;
      runner.speed = 0;

      // Game over.
      if (this.score === RUNNERS_NUM) {
        this.state = 'ended';
        this.bull.setVelocityX(0);
      }
    }
  }

  update() {
    if (this.state === 'running') {
      if (this.cursors.up.isDown) {
        this.speed = Math.min(this.speed + SPEED_INCREMENT, SPEED_MAX);
      }
      else if (this.cursors.down.isDown) {
        this.speed = Math.max(0, this.speed - SPEED_INCREMENT);
      }
      else if (this.cursors.right.isDown) {
        this.bull_positionX += BULL_POSITIONX_SPEED;
        this.bull.setVelocityX(this.bull_positionX);
      }
      else if (this.cursors.left.isDown) {
        this.bull_positionX -= BULL_POSITIONX_SPEED;
        this.bull.setVelocityX(this.bull_positionX);
      }

      this.background.tilePositionY -= this.speed;

      Phaser.Actions.Call(this.runnerGroup.getChildren(), runner => {
        runner.y += this.speed - runner.speed;
      }, this);
    }
  }

  start() {
    this.state = 'new';
    this.score = 0;
    this.speed = 0;
    this.bull_positionX = config.width / 2;
    this.bull.setVelocityX(0);
    this.scoreText.setText('Score:' + this.score);

    Phaser.Actions.Call(this.runnerGroup.getChildren(), runner => {
      let runner_position_x = Phaser.Math.Between(BOUNDS, this.config.width - (2 * BOUNDS));
      let runner_position_y = Phaser.Math.Between(this.config.height - 200, this.config.height - 250);
      runner.setPosition(runner_position_x, runner_position_y);
      runner.speed = Phaser.Math.Between(2, SPEED_MAX - 5)
      runner.anims.play('standing', true);
      runner.caught = false;
    }, this);
  }

}
