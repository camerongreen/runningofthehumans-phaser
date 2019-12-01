import {TitleScene} from "./TitleScene.js";

export class GameScene extends Phaser.Scene {
  // Constants.
  #bounds = 105;
  #bullPositionXSpeed = 25;
  #missedPenalty = 5;
  #runnersNum = 10;
  #speedIncrement = 0.1;
  #speedMax = 20;

  // Public.
  state = 'new';

  // Private.
  #background = null;
  #bull = null;
  #bullPositionX = 0;
  #config = {};
  #cursors = null;
  #bestTimeText = null;
  #bestTimeEmitter = null;
  #missed = null;
  #lastTime = null;
  #missedScore = 0;
  #music = null;
  #ole = null;
  #runnerGroup = null;
  #resultsText = null;
  #score = 0;
  #scoreText = null;
  #speed = 0;
  #speedIndicator = null;
  #timer = 0;
  #timerText = 0;

  constructor(name, config) {
    super(name);
    this.#config = config;
  }

  preload() {
    this.load.image('bg', 'assets/img/bg.png');
    this.load.image('bull', 'assets/img/bull.png');
    this.load.image('best_time', 'assets/img/best_time.png');
    this.load.image('red', 'assets/img/red.png');

    this.load.spritesheet('runner',
      'assets/img/runner.png',
      { frameWidth: 40, frameHeight: 40 },
    );
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
    this.#missed = this.sound.add('missed', { volume: 0.1 });
    this.#music = this.sound.add('music');
    this.#ole = this.sound.add('ole', { volume: 0.1 });

    this.#background = this.add.tileSprite(this.#config.width / 2, this.#config.height / 2, this.#config.width, this.#config.height, 'bg');

    let speedBg = this.add.rectangle(this.#config.width - 40, this.#config.height - 100, 20, 100, 0xffffff);
    speedBg.setStrokeStyle(2, 0xffffff);

    var graphics = this.add.graphics();
    graphics.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
    graphics.fillRect(this.#config.width - 50, this.#config.height - 150, 20, 100);

    this.#speedIndicator = this.add.rectangle(this.#config.width - 40, this.#config.height - 100, 20, 100, 0xffffff);
    this.#speedIndicator.setStrokeStyle(2, 0xffffff);

    this.#scoreText = this.add.text(16, 16, ``, {
      fontSize: '32px',
      fill: '#000',
    });

    this.#timerText = this.add.text(this.#config.width - 210, 16, ``, {
      fontSize: '32px',
      fill: '#000',
    });

    this.#resultsText = this.add.text(this.#config.width / 2, this.#config.height / 2, ``, {
      font: 'bold 28px Arial',
      fill: '#fff',
      align: "center",
    }).setOrigin(0.5);

    this.#resultsText.setShadow(3, 4, 'rgba(0,0,0,0.5', 5);

    this.physics.world.setBounds(this.#bounds, 0, this.#config.width - (2 * this.#bounds), this.#config.height);

    this.#bull = this.physics.add.sprite(this.#config.width / 2, this.#config.height - 78, 'bull');
    this.#bull.setCollideWorldBounds(true);
    this.#bull.body.onWorldBounds = true;
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

    this.#runnerGroup = this.physics.add.group({
      key: 'runner',
      repeat: this.#runnersNum - 1,
    });

    this.physics.add.overlap(this.#bull, this.#runnerGroup.getChildren(), (bull, runner) => {
      this.gotRunner(bull, runner)
    }, null, this);

    this.#cursors = this.input.keyboard.createCursorKeys();

    let space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
          this.#music.stop();
          this.scene.switch(TitleScene.name);
          break;
        case 'ready':
          this.state = 'running';
          this.#music.play();
          Phaser.Actions.Call(this.#runnerGroup.getChildren(), runner => {
            runner.anims.play('running', true);
          }, this);
      }
    });
  }

  pause() {
    this.anims.pauseAll();
    this.#music.pause();
    this.#bull.setVelocityX(0);
  }

  resume() {
    this.anims.resumeAll();
    this.#music.resume();
  }

  hitWorldBounds(body) {
    this.#bull.setVelocityX(0);
  }

  gotRunner(bull, runner) {
    if (!runner.caught) {
      this.#ole.play();
      runner.anims.play('caught', true);
      this.#score += 1;
      this.updateScore();
      runner.caught = true;
      runner.speed = 0;

      this.checkFinish();
    }
  }

  missedRunner(runner) {
    if (!runner.caught) {
      this.#missed.play();
      this.#score += 1;
      this.#missedScore += 1;
      let missedText = this.add.text(runner.x, this.#config.height - 25, `${this.#missedPenalty} secs`, {
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
      runner.caught = true;
      runner.speed = 0;

      this.checkFinish();
    }
  }

  checkFinish() {
    // Game over.
    if (this.#score === this.#runnersNum) {
      this.state = 'ended';
      this.#bull.setVelocityX(0);
      this.showResult();
    }
  }

  setSpeed(speed) {
    speed = Math.max(speed, 0);
    speed = Math.min(speed, this.#speedMax);
    this.#speedIndicator.height = 100 - (100 / this.#speedMax) * speed;
    this.#speed = speed;
  }

  update(time) {
    if (this.state === 'new') {
      this.reset();
      this.state = 'ready';
    }

    if (this.state === 'running') {
      this.#timer += Date.now() - this.#lastTime;
      this.updateTimer();
      if (this.#cursors.up.isDown) {
        this.setSpeed(this.#speed + this.#speedIncrement);
      }
      else if (this.#cursors.down.isDown) {
        this.setSpeed(this.#speed - this.#speedIncrement);
      }
      else if (this.#cursors.right.isDown) {
        this.#bullPositionX += this.#bullPositionXSpeed;
        this.#bull.setVelocityX(this.#bullPositionX);
      }
      else if (this.#cursors.left.isDown) {
        this.#bullPositionX -= this.#bullPositionXSpeed;
        this.#bull.setVelocityX(this.#bullPositionX);
      }

      this.#background.tilePositionY -= this.#speed;

      Phaser.Actions.Call(this.#runnerGroup.getChildren(), runner => {
        runner.y += this.#speed - runner.speed;
        if (runner.y > this.#config.height + 10) {
          this.missedRunner(runner);
        }
      }, this);
    }
    this.#lastTime = Date.now();
  }

  showResult() {
    let seconds = this.#timer / 1000;

    let totalTime = seconds + (this.#missedScore * this.#missedPenalty);
    let scoreScreen = this.scene.get(TitleScene.name);
    let bestTime = scoreScreen.setBestTime(totalTime);

    if (bestTime) {
      if (this.#bestTimeText) {
        this.#bestTimeText.setVisible(true);
        this.#bestTimeEmitter.start();
      }
      else {
        let particles = this.add.particles('red');

        this.#bestTimeEmitter = particles.createEmitter({
          speed: 100,
          scale: { start: 1, end: 0 },
          blendMode: 'ADD',
        });

        let btt = this.add.text(0, 0, 'Best time!', {
          fontSize: '32px',
          fill: '#FF0000',
        }).setOrigin(0.5);

        let container = this.add.container(400, 100, [btt]);

        this.physics.world.enableBody(container);

        container.body.setVelocity(100, 200);
        container.body.setBounce(1, 1);
        container.body.setCollideWorldBounds(true);

        this.#bestTimeEmitter.startFollow(container);

        this.#bestTimeText = container;
      }
    }

    let text = `
    Total: ${totalTime.toFixed(1)}
    =
    Time: ${seconds.toFixed(1)}
    +
    Missed runners: ${this.#missedScore} * ${this.#missedPenalty} secs
    `;
    this.#resultsText.setText(text);
  }

  updateScore() {
    this.#scoreText.setText(`Runners: ${this.#score}/${this.#runnersNum}`);
  }

  updateTimer() {
    let seconds = this.#timer / 1000;
    this.#timerText.setText(`Time: ${seconds.toFixed(1).padStart(4, " ")}`);
  }

  clear() {
    this.#score = 0;
    this.#missedScore = 0;
    this.#speed = 0;
    this.#bullPositionX = 0;
    this.#bull.x = this.#config.width / 2;
    this.#lastTime = Date.now();
    this.#timer = 0;
    this.updateScore();
    this.updateTimer(0);
    this.#music.stop();
    this.#resultsText.setText('');
    if (this.#bestTimeText) {
      this.#bestTimeText.setVisible(false);
      this.#bestTimeEmitter.stop();
    }
  }

  reset() {
    this.clear();

    var first = true;

    Phaser.Actions.Call(this.#runnerGroup.getChildren(), runner => {
      let runner_position_x = Phaser.Math.Between(this.#bounds, this.#config.width - (2 * this.#bounds));
      let runner_position_y = Phaser.Math.Between(this.#config.height - 200, this.#config.height - 250);
      runner.setPosition(runner_position_x, runner_position_y);
      // Always have one runner at top speed to make timings fair.
      if (first) {
        runner.speed = this.#speedMax - 6;
        first = false;
      }
      else {
        runner.speed = Phaser.Math.Between(4, this.#speedMax - 6);
      }
      runner.anims.play('standing', true);
      runner.caught = false;
    }, this);
  }

}

