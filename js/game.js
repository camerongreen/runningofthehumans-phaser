var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0}
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const BOUNDS = 105;
const BULL_POSITIONX_SPEED = 20;
const RUNNERS_NUM = 5;
const SPEED_INCREMENT = 0.1;
const SPEED_MAX = 25;

var bull;
var bull_positionX = 0;
var cursors;
var game = new Phaser.Game(config);
var runnerGroup;
var score = 0;
var space;
var speed = 0;
var state = 'title-screen';

function preload() {
  this.load.image('bg', 'assets/bg.png');
  this.load.image('bull', 'assets/bull.png');
  this.load.spritesheet('runner',
      'assets/runner.png',
      {frameWidth: 40, frameHeight: 40}
  );
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();
  space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  space.on('down', handleSpace)

  this.background = this.add.tileSprite(config.width / 2, config.height / 2, config.width, config.height, 'bg');

  scoreText = this.add.text(16, 16, 'score: 0', {
    fontSize: '32px',
    fill: '#000'
  });

  this.physics.world.setBounds(BOUNDS, 0, config.width - (2 * BOUNDS), config.height);

  bull = this.physics.add.sprite(config.width / 2, config.height - 78, 'bull');
  bull.setCollideWorldBounds(true);
  bull.body.onWorldBounds = true
  this.physics.world.on('worldbounds', hitWorldBounds);

  this.anims.create({
    key: 'running',
    frames: this.anims.generateFrameNumbers('runner', {start: 0, end: 5}),
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

  runnerGroup = this.physics.add.group({
    key: 'runner',
    repeat: RUNNERS_NUM,
  });

  Phaser.Actions.Call(runnerGroup.getChildren(), function (runner) {
    let runner_position_x = Phaser.Math.Between(BOUNDS, config.width - (2 * BOUNDS));
    let runner_position_y = Phaser.Math.Between(config.height - 200, config.height - 250);
    runner.setPosition(runner_position_x, runner_position_y);
    runner.speed = Phaser.Math.Between(2, 15)
  });

  this.physics.add.overlap(bull, runnerGroup.getChildren(), gotRunner, null, this);
}

function hitWorldBounds(body) {
  bull_positionX = 0;
  bull.setVelocityX(0);
}

function gotRunner(bull, runner) {
  if (!runner.hasOwnProperty('caught')) {
    runner.anims.play('caught', true);
    score += 1;
    scoreText.setText('Score:' + score);
    runner.caught = true;
    runner.speed = 0;

    // Game over.
    if (score === RUNNERS_NUM) {
      state = 'ended';
      game.scene.stop();
    }
  }
}

function update() {
  if (state === 'running') {
    if (cursors.up.isDown) {
      speed = Math.min(speed + SPEED_INCREMENT, SPEED_MAX);
    }
    else if (cursors.down.isDown) {
      speed = Math.max(0, speed - SPEED_INCREMENT);
    }
    else if (cursors.right.isDown) {
      bull_positionX += BULL_POSITIONX_SPEED;
      bull.setVelocityX(bull_positionX);
    }
    else if (cursors.left.isDown) {
      bull_positionX -= BULL_POSITIONX_SPEED;
      bull.setVelocityX(bull_positionX);
    }

    this.background.tilePositionY -= speed;

    Phaser.Actions.Call(runnerGroup.getChildren(), function (runner) {
      runner.y += speed - runner.speed;
    });
  }
}

function handleSpace(event) {
  switch (state) {
    case 'title-screen':
      state = 'running';
      Phaser.Actions.Call(runnerGroup.getChildren(), function (runner) {
        runner.anims.play('running', true);
      });
      break;
    case 'running':
      game.scene.pause();
      state = 'pause';
      break;
    case 'pause':
      game.scene.resume();
      state = 'running';
      break;
    case 'ended':
      state = 'title-screen';
      break;
  }
}
