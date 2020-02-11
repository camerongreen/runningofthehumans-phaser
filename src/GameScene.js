export default class GameScene extends Phaser.Scene {
  constructor(name, config) {
    super(name);
    this.config = config;

    // Constants.
    this.bounds = 105;
    this.bullPositionXSpeed = 25;
    this.missedPenalty = 5;
    this.runnersNum = 10;
    this.speedIncrement = 0.1;
    this.speedMax = 20;

    // Public.
    this.state = 'new';

    // Private.
    this.background = null;
    this.bull = null;
    this.bullPositionX = 0;
    this.cursors = null;
    this.bestTimeText = null;
    this.bestTimeEmitter = null;
    this.missed = null;
    this.lastTime = null;
    this.missedScore = 0;
    this.music = null;
    this.ole = null;
    this.runnerGroup = null;
    this.resultsText = null;
    this.score = 0;
    this.scoreText = null;
    this.speed = 0;
    this.speedIndicator = null;
    this.timer = 0;
    this.timerText = 0;
  }

  preload() {
    this.load.image('bg', 'assets/img/bg.png');
    this.load.image('bull', 'assets/img/bull.png');
    this.load.image('best_time', 'assets/img/best_time.png');
    this.load.image('red', 'assets/img/red.png');

    this.load.spritesheet('runner', 'assets/img/runner.png', {
      frameWidth: 40,
      frameHeight: 40,
    });
    this.load.audio('missed', [
      'assets/audio/missed.ogg',
      'assets/audio/missed.mp3',
    ]);
    this.load.audio('music', [
      'assets/audio/espana.ogg',
      'assets/audio/espana.mp3',
    ]);
    this.load.audio('ole', [
      'assets/audio/ole.ogg',
      'assets/audio/ole.mp3',
    ]);
  }

  create() {
    this.missed = this.sound.add('missed', { volume: 0.1 });
    this.music = this.sound.add('music');
    this.ole = this.sound.add('ole', { volume: 0.1 });

    this.background = this.add.tileSprite(this.config.width / 2,
      this.config.height / 2, this.config.width, this.config.height, 'bg');

    const speedBg = this.add.rectangle(this.config.width - 40,
      this.config.height - 100, 20, 100, 0xffffff);
    speedBg.setStrokeStyle(2, 0xffffff);

    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
    graphics.fillRect(this.config.width - 50, this.config.height - 150, 20, 100);

    this.speedIndicator = this.add.rectangle(this.config.width - 40,
      this.config.height - 100, 20, 100, 0xffffff);
    this.speedIndicator.setStrokeStyle(2, 0xffffff);

    this.scoreText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#000',
    });

    this.timerText = this.add.text(this.config.width - 210, 16, '', {
      fontSize: '32px',
      fill: '#000',
    });

    this.resultsText = this.add.text(this.config.width / 2, this.config.height / 2, '', {
      font: 'bold 28px Arial',
      fill: '#fff',
      align: 'center',
    }).setOrigin(0.5);

    this.resultsText.setShadow(3, 4, 'rgba(0,0,0,0.5', 5);

    this.physics.world.setBounds(this.bounds, 0,
      this.config.width - (2 * this.bounds), this.config.height);

    this.bull = this.physics.add.sprite(this.config.width / 2, this.config.height - 78, 'bull');
    this.bull.setCollideWorldBounds(true);
    this.bull.body.onWorldBounds = true;
    this.physics.world.on('worldbounds', () => {
      this.hitWorldBounds();
    });

    this.anims.create({
      key: 'running',
      frames: this.anims.generateFrameNumbers('runner', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'caught',
      frames: [{ key: 'runner', frame: 6 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'standing',
      frames: [{ key: 'runner', frame: 0 }],
      frameRate: 20,
    });

    this.runnerGroup = this.physics.add.group({
      key: 'runner',
      repeat: this.runnersNum - 1,
    });

    this.physics.add.overlap(this.bull, this.runnerGroup.getChildren(), (bull, runner) => {
      this.gotRunner(runner);
    }, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();

    const space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    space.on('up', () => {
      switch (this.state) {
        case 'running':
          this.state = 'pause';
          this.pause();
          break;
        case 'pause':
          this.state = 'running';
          this.resume();
          break;
        case 'ended':
          this.music.stop();
          this.scene.switch('TitleScene');
          break;
        case 'ready':
          this.state = 'running';
          this.music.play();
          Phaser.Actions.Call(this.runnerGroup.getChildren(), (runner) => {
            runner.anims.play('running', true);
          }, this);
          break;
        default:
          break;
      }
    });
  }

  pause() {
    this.anims.pauseAll();
    this.music.pause();
    this.bull.setVelocityX(0);
  }

  resume() {
    this.anims.resumeAll();
    this.music.resume();
  }

  hitWorldBounds() {
    this.bull.setVelocityX(0);
    this.bullPositionX = 0;
  }

  gotRunner(runner) {
    if (!runner.caught) {
      const rnr = runner;
      this.ole.play();
      rnr.anims.play('caught', true);
      this.score += 1;
      this.updateScore();
      rnr.caught = true;
      rnr.speed = 0;

      this.checkFinish();
    }
  }

  missedRunner(runner) {
    if (!runner.caught) {
      const rnr = runner;
      this.missed.play();
      this.score += 1;
      this.missedScore += 1;
      const missedText = this.add.text(rnr.x, this.config.height - 25, `${this.missedPenalty} secs`, {
        fontSize: '22px',
        fill: '#F00',
      }).setOrigin(0.5);
      this.tweens.add({
        targets: missedText,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
      }, this);
      this.updateScore();
      rnr.caught = true;
      rnr.speed = 0;

      this.checkFinish();
    }
  }

  checkFinish() {
    // Game over.
    if (this.score === this.runnersNum) {
      this.state = 'ended';
      this.bull.setVelocityX(0);
      this.showResult();
    }
  }

  setSpeed(speed) {
    let gameSpeed = Math.max(speed, 0);
    gameSpeed = Math.min(gameSpeed, this.speedMax);
    this.speedIndicator.height = 100 - (100 / this.speedMax) * gameSpeed;
    this.speed = gameSpeed;
  }

  update() {
    if (this.state === 'new') {
      this.reset();
      this.state = 'ready';
    }

    if (this.state === 'running') {
      this.timer += Date.now() - this.lastTime;
      this.updateTimer();
      if (this.cursors.up.isDown) {
        this.setSpeed(this.speed + this.speedIncrement);
      } else if (this.cursors.down.isDown) {
        this.setSpeed(this.speed - this.speedIncrement);
      } else if (this.cursors.right.isDown) {
        this.bullPositionX += this.bullPositionXSpeed;
        this.bull.setVelocityX(this.bullPositionX);
      } else if (this.cursors.left.isDown) {
        this.bullPositionX -= this.bullPositionXSpeed;
        this.bull.setVelocityX(this.bullPositionX);
      }

      this.background.tilePositionY -= this.speed;

      Phaser.Actions.Call(this.runnerGroup.getChildren(), (runner) => {
        const rnr = runner;
        rnr.y += this.speed - rnr.speed;
        if (rnr.y > this.config.height + 10) {
          this.missedRunner(runner);
        }
      }, this);
    }
    this.lastTime = Date.now();
  }

  showResult() {
    const seconds = this.timer / 1000;

    const totalTime = seconds + (this.missedScore * this.missedPenalty);
    const scoreScreen = this.scene.get('TitleScene');
    const bestTime = scoreScreen.setBestTime(totalTime);

    if (bestTime) {
      if (this.bestTimeText) {
        this.bestTimeText.setVisible(true);
        this.bestTimeEmitter.start();
      } else {
        const particles = this.add.particles('red');

        this.bestTimeEmitter = particles.createEmitter({
          speed: 100,
          scale: { start: 1, end: 0 },
          blendMode: 'ADD',
        });

        const btt = this.add.text(0, 0, 'Best time!', {
          fontSize: '32px',
          fill: '#FF0000',
        }).setOrigin(0.5);

        const container = this.add.container(400, 100, [btt]);

        this.physics.world.enableBody(container);

        container.body.setVelocity(100, 200);
        container.body.setBounce(1, 1);
        container.body.setCollideWorldBounds(true);

        this.bestTimeEmitter.startFollow(container);

        this.bestTimeText = container;
      }
    }

    const text = `
    Total: ${totalTime.toFixed(1)}
    =
    Time: ${seconds.toFixed(1)}
    +
    Missed runners: ${this.missedScore} * ${this.missedPenalty} secs
    `;
    this.resultsText.setText(text);
  }

  updateScore() {
    this.scoreText.setText(`Runners: ${this.score}/${this.runnersNum}`);
  }

  updateTimer() {
    const seconds = this.timer / 1000;
    this.timerText.setText(`Time: ${seconds.toFixed(1).padStart(4, ' ')}`);
  }

  clear() {
    this.score = 0;
    this.missedScore = 0;
    this.speed = 0;
    this.bullPositionX = 0;
    this.bull.x = this.config.width / 2;
    this.lastTime = Date.now();
    this.timer = 0;
    this.updateScore();
    this.updateTimer(0);
    this.music.stop();
    this.resultsText.setText('');
    if (this.bestTimeText) {
      this.bestTimeText.setVisible(false);
      this.bestTimeEmitter.stop();
    }
  }

  reset() {
    this.clear();

    let first = true;

    Phaser.Actions.Call(this.runnerGroup.getChildren(), (runner) => {
      const runnerX = Phaser.Math.Between(this.bounds, this.config.width - (2 * this.bounds));
      const runnerY = Phaser.Math.Between(this.config.height - 200, this.config.height - 250);

      const rnr = runner;
      rnr.setPosition(runnerX, runnerY);
      // Always have one runner at top speed to make timings fair.
      if (first) {
        rnr.speed = this.speedMax - 6;
        first = false;
      } else {
        rnr.speed = Phaser.Math.Between(4, this.speedMax - 6);
      }
      rnr.anims.play('standing', true);
      rnr.caught = false;
    }, this);
  }
}
