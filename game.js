const canvas =
  document.getElementById("gameCanvas");

const ctx =
  canvas.getContext("2d");


/* =========================
   ELEMENTS
========================= */

const menuScreen =
  document.getElementById("menuScreen");

const gameScreen =
  document.getElementById("gameScreen");

const playButton =
  document.getElementById("playButton");

const difficultyButtons =
  document.querySelectorAll(".difficulty");

const menuHighScore =
  document.getElementById("menuHighScore");

const scoreText =
  document.getElementById("score");

const livesText =
  document.getElementById("lives");

const coinsText =
  document.getElementById("coins");

const highScoreText =
  document.getElementById("highScore");

const startButton =
  document.getElementById("startButton");

const leftButton =
  document.getElementById("leftButton");

const rightButton =
  document.getElementById("rightButton");


/* =========================
   GAME VARIABLES
========================= */

let player;

let enemies = [];

let coins = [];

let score = 0;

let lives = 3;

let coinCount = 0;

let gameRunning = false;

let paused = false;

let animationId;

let roadOffset = 0;

let hitCooldown = 0;

let crashEffect = 0;

let selectedDifficulty = "easy";


/* =========================
   HIGH SCORE
========================= */

let highScore =
  Number(
    localStorage.getItem(
      "trafficDodgeHighScore"
    )
  ) || 0;

menuHighScore.textContent =
  highScore;

highScoreText.textContent =
  highScore;


/* =========================
   DIFFICULTY SETTINGS
========================= */

const difficultySettings = {

  easy: {
    enemySpeed: 3.5,
    spawnTime: 1200,
    coinTime: 1000
  },

  normal: {
    enemySpeed: 4.5,
    spawnTime: 1000,
    coinTime: 1200
  },

  hard: {
    enemySpeed: 6,
    spawnTime: 750,
    coinTime: 1400
  }

};


/* =========================
   ROAD
========================= */

const road = {
  x: 50,
  width: 300
};


/* =========================
   SOUND
========================= */

let audioContext = null;


function initAudio() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();
  }
}


function playSound(
  frequency,
  duration,
  type = "sine",
  volume = 0.08
) {

  if (!audioContext) {
    return;
  }


  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();


  oscillator.type =
    type;

  oscillator.frequency.value =
    frequency;


  gain.gain.value =
    volume;


  oscillator.connect(gain);

  gain.connect(
    audioContext.destination
  );


  oscillator.start();


  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime +
      duration
  );


  oscillator.stop(
    audioContext.currentTime +
      duration
  );
}


/* =========================
   DIFFICULTY SELECTION
========================= */

difficultyButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        difficultyButtons.forEach(
          item => {

            item.classList.remove(
              "active"
            );
          }
        );


        button.classList.add(
          "active"
        );


        selectedDifficulty =
          button.dataset.level;
      }
    );
  }
);


/* =========================
   RESET
========================= */

function resetGame() {

  player = {

    x: 175,

    y: 500,

    width: 50,

    height: 80,

    speed: 7
  };


  enemies = [];

  coins = [];


  score = 0;

  lives = 3;

  coinCount = 0;


  roadOffset = 0;

  hitCooldown = 0;

  crashEffect = 0;

  paused = false;


  gameRunning = true;


  scoreText.textContent =
    score;

  livesText.textContent =
    lives;

  coinsText.textContent =
    coinCount;

  highScoreText.textContent =
    highScore;
}


/* =========================
   DRAW ROAD
========================= */

function drawRoad() {

  ctx.fillStyle =
    "#174d25";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.fillStyle =
    "#555";

  ctx.fillRect(
    road.x,
    0,
    road.width,
    canvas.height
  );


  ctx.fillStyle =
    "#ffffff";

  ctx.fillRect(
    road.x,
    0,
    5,
    canvas.height
  );


  ctx.fillRect(
    road.x +
      road.width -
      5,
    0,
    5,
    canvas.height
  );


  roadOffset += 8;


  if (
    roadOffset >= 60
  ) {

    roadOffset = 0;
  }


  ctx.strokeStyle =
    "#ffffff";

  ctx.lineWidth = 5;


  ctx.setLineDash(
    [30, 30]
  );

  ctx.lineDashOffset =
    roadOffset;


  ctx.beginPath();

  ctx.moveTo(
    150,
    0
  );

  ctx.lineTo(
    150,
    canvas.height
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    250,
    0
  );

  ctx.lineTo(
    250,
    canvas.height
  );

  ctx.stroke();


  ctx.setLineDash([]);

  ctx.lineDashOffset =
    0;


  drawTrees();
}


/* =========================
   TREES
========================= */

function drawTrees() {

  const positions =
    [80, 320];


  positions.forEach(
    x => {

      for (
        let y = -100;
        y <
        canvas.height +
          100;
        y += 130
      ) {

        const treeY =
          (
            y +
            roadOffset *
              2
          ) %
            700 -
          100;


        ctx.fillStyle =
          "#795548";

        ctx.fillRect(
          x - 5,
          treeY + 25,
          10,
          30
        );


        ctx.fillStyle =
          "#2e7d32";

        ctx.beginPath();

        ctx.arc(
          x,
          treeY + 20,
          23,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    }
  );
}


/* =========================
   PLAYER
========================= */

function drawPlayer() {

  if (
    hitCooldown > 0 &&
    Math.floor(
      hitCooldown / 5
    ) %
      2 ===
      0
  ) {

    return;
  }


  ctx.fillStyle =
    "#1976d2";

  ctx.fillRect(
    player.x,
    player.y,
    player.width,
    player.height
  );


  ctx.fillStyle =
    "#1565c0";

  ctx.fillRect(
    player.x + 7,
    player.y + 8,
    player.width - 14,
    48
  );


  ctx.fillStyle =
    "#b3e5fc";

  ctx.fillRect(
    player.x + 10,
    player.y + 13,
    player.width - 20,
    18
  );


  ctx.fillRect(
    player.x + 10,
    player.y + 35,
    player.width - 20,
    15
  );


  ctx.fillStyle =
    "#111";


  ctx.fillRect(
    player.x - 5,
    player.y + 10,
    8,
    22
  );


  ctx.fillRect(
    player.x +
      player.width -
      3,
    player.y + 10,
    8,
    22
  );


  ctx.fillRect(
    player.x - 5,
    player.y + 50,
    8,
    22
  );


  ctx.fillRect(
    player.x +
      player.width -
      3,
    player.y + 50,
    8,
    22
  );


  ctx.fillStyle =
    "#fff59d";


  ctx.fillRect(
    player.x + 6,
    player.y + 2,
    10,
    6
  );


  ctx.fillRect(
    player.x +
      player.width -
      16,
    player.y + 2,
    10,
    6
  );
}


/* =========================
   CREATE ENEMY
========================= */

function createEnemy() {

  const lanes =
    [75, 175, 275];


  const lane =
    lanes[
      Math.floor(
        Math.random() *
          lanes.length
      )
    ];


  const colors = [
    "#e53935",
    "#43a047",
    "#8e24aa",
    "#fb8c00"
  ];


  const settings =
    difficultySettings[
      selectedDifficulty
    ];


  const difficultyBoost =
    Math.min(
      score * 0.05,
      4
    );


  enemies.push({

    x: lane,

    y: -100,

    width: 50,

    height: 80,

    speed:
      settings.enemySpeed +
      Math.random() * 2 +
      difficultyBoost,

    color:
      colors[
        Math.floor(
          Math.random() *
            colors.length
        )
      ]
  });
}


/* =========================
   DRAW ENEMIES
========================= */

function drawEnemies() {

  enemies.forEach(
    enemy => {

      ctx.fillStyle =
        enemy.color;


      ctx.fillRect(
        enemy.x,
        enemy.y,
        enemy.width,
        enemy.height
      );


      ctx.fillStyle =
        "#222";


      ctx.fillRect(
        enemy.x + 7,
        enemy.y + 8,
        enemy.width - 14,
        48
      );


      ctx.fillStyle =
        "#b3e5fc";


      ctx.fillRect(
        enemy.x + 10,
        enemy.y + 13,
        enemy.width - 20,
        18
      );


      ctx.fillRect(
        enemy.x + 10,
        enemy.y + 35,
        enemy.width - 20,
        15
      );


      ctx.fillStyle =
        "#111";


      ctx.fillRect(
        enemy.x - 5,
        enemy.y + 10,
        8,
        22
      );


      ctx.fillRect(
        enemy.x +
          enemy.width -
          3,
        enemy.y + 10,
        8,
        22
      );


      ctx.fillRect(
        enemy.x - 5,
        enemy.y + 50,
        8,
        22
      );


      ctx.fillRect(
        enemy.x +
          enemy.width -
          3,
        enemy.y + 50,
        8,
        22
      );
    }
  );
}


/* =========================
   CREATE COIN
========================= */

function createCoin() {

  const lanes =
    [75, 175, 275];


  const lane =
    lanes[
      Math.floor(
        Math.random() *
          lanes.length
      )
    ];


  coins.push({

    x:
      lane + 25,

    y: -30,

    radius: 13,

    speed: 4
  });
}


/* =========================
   DRAW COINS
========================= */

function drawCoins() {

  coins.forEach(
    coin => {

      ctx.fillStyle =
        "#ffd700";


      ctx.beginPath();

      ctx.arc(
        coin.x,
        coin.y,
        coin.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();


      ctx.strokeStyle =
        "#fff176";

      ctx.lineWidth = 3;

      ctx.stroke();


      ctx.fillStyle =
        "#8d6e00";

      ctx.font =
        "bold 16px Arial";

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";


      ctx.fillText(
        "$",
        coin.x,
        coin.y
      );
    }
  );
}


/* =========================
   UPDATE ENEMIES
========================= */

function updateEnemies() {

  enemies.forEach(
    enemy => {

      enemy.y +=
        enemy.speed;
    }
  );


  enemies =
    enemies.filter(
      enemy => {

        if (
          enemy.y >
          canvas.height
        ) {

          score++;

          scoreText.textContent =
            score;

          return false;
        }

        return true;
      }
    );
}


/* =========================
   UPDATE COINS
========================= */

function updateCoins() {

  coins.forEach(
    coin => {

      coin.y +=
        coin.speed;
    }
  );


  coins =
    coins.filter(
      coin =>
        coin.y <
        canvas.height +
          50
    );
}


/* =========================
   COLLISION
========================= */

function isColliding(
  a,
  b
) {

  return (

    a.x <
      b.x +
        b.width &&

    a.x +
      a.width >
      b.x &&

    a.y <
      b.y +
        b.height &&

    a.y +
      a.height >
      b.y
  );
}


/* =========================
   ENEMY COLLISION
========================= */

function checkEnemyCollision() {

  if (
    hitCooldown > 0
  ) {

    return;
  }


  for (
    let i = 0;
    i < enemies.length;
    i++
  ) {

    const enemy =
      enemies[i];


    if (
      isColliding(
        player,
        enemy
      )
    ) {

      enemies.splice(
        i,
        1
      );


      lives--;


      livesText.textContent =
        lives;


      hitCooldown =
        120;


      crashEffect =
        20;


      playSound(
        100,
        0.35,
        "sawtooth",
        0.15
      );


      player.x =
        175;


      if (
        lives <= 0
      ) {

        endGame();
      }


      return;
    }
  }
}


/* =========================
   COIN COLLISION
========================= */

function checkCoinCollision() {

  for (
    let i =
      coins.length - 1;
    i >= 0;
    i--
  ) {

    const coin =
      coins[i];


    const coinBox = {

      x:
        coin.x -
        coin.radius,

      y:
        coin.y -
        coin.radius,

      width:
        coin.radius *
        2,

      height:
        coin.radius *
        2
    };


    if (
      isColliding(
        player,
        coinBox
      )
    ) {

      coins.splice(
        i,
        1
      );


      coinCount++;


      coinsText.textContent =
        coinCount;


      score += 5;


      scoreText.textContent =
        score;


      playSound(
        800,
        0.12,
        "sine",
        0.1
      );
    }
  }
}


/* =========================
   CRASH EFFECT
========================= */

function drawCrashEffect() {

  if (
    crashEffect <= 0
  ) {

    return;
  }


  ctx.fillStyle =
    `rgba(255, 80, 0, ${
      crashEffect / 30
    })`;


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  crashEffect--;
}


/* =========================
   GAME OVER
========================= */

function endGame() {

  gameRunning =
    false;

  paused =
    false;


  cancelAnimationFrame(
    animationId
  );


  if (
    score >
    highScore
  ) {

    highScore =
      score;


    localStorage.setItem(
      "trafficDodgeHighScore",
      highScore
    );
  }


  highScoreText.textContent =
    highScore;


  menuHighScore.textContent =
    highScore;


  ctx.fillStyle =
    "rgba(0, 0, 0, 0.82)";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.fillStyle =
    "white";


  ctx.textAlign =
    "center";


  ctx.font =
    "40px Arial";


  ctx.fillText(
    "GAME OVER",
    canvas.width / 2,
    220
  );


  ctx.font =
    "24px Arial";


  ctx.fillText(
    `Score: ${score}`,
    canvas.width / 2,
    275
  );


  ctx.fillText(
    `Coins: ${coinCount}`,
    canvas.width / 2,
    315
  );


  ctx.fillText(
    `Best: ${highScore}`,
    canvas.width / 2,
    355
  );


  startButton.textContent =
    "BACK TO MENU";
}


/* =========================
   PAUSE SCREEN
========================= */

function drawPauseScreen() {

  ctx.fillStyle =
    "rgba(0, 0, 0, 0.65)";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.fillStyle =
    "white";


  ctx.textAlign =
    "center";


  ctx.font =
    "42px Arial";


  ctx.fillText(
    "PAUSED",
    canvas.width / 2,
    canvas.height / 2
  );
}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

  if (
    !gameRunning
  ) {

    return;
  }


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  if (
    !paused
  ) {

    if (
      hitCooldown > 0
    ) {

      hitCooldown--;
    }


    drawRoad();

    updateEnemies();

    updateCoins();

    drawEnemies();

    drawCoins();

    drawPlayer();

    checkEnemyCollision();

    checkCoinCollision();

    drawCrashEffect();

  } else {

    drawRoad();

    drawEnemies();

    drawCoins();

    drawPlayer();

    drawPauseScreen();
  }


  animationId =
    requestAnimationFrame(
      gameLoop
    );
}


/* =========================
   START GAME
========================= */

function startGame() {

  initAudio();


  if (
    audioContext &&
    audioContext.state ===
      "suspended"
  ) {

    audioContext.resume();
  }


  cancelAnimationFrame(
    animationId
  );


  resetGame();


  menuScreen.classList.add(
    "hidden"
  );


  gameScreen.classList.remove(
    "hidden"
  );


  startButton.textContent =
    "PAUSE";


  gameLoop();
}


/* =========================
   BACK TO MENU
========================= */

function backToMenu() {

  gameRunning =
    false;

  paused =
    false;


  cancelAnimationFrame(
    animationId
  );


  gameScreen.classList.add(
    "hidden"
  );


  menuScreen.classList.remove(
    "hidden"
  );


  menuHighScore.textContent =
    highScore;
}


/* =========================
   PAUSE / RESUME
========================= */

function togglePause() {

  if (
    !gameRunning
  ) {

    return;
  }


  paused =
    !paused;


  if (
    paused
  ) {

    startButton.textContent =
      "RESUME";

  } else {

    startButton.textContent =
      "PAUSE";
  }
}


/* =========================
   MOVE LEFT
========================= */

function moveLeft() {

  if (
    !gameRunning ||
    paused
  ) {

    return;
  }


  player.x -=
    player.speed;


  if (
    player.x <
    road.x
  ) {

    player.x =
      road.x;
  }
}


/* =========================
   MOVE RIGHT
========================= */

function moveRight() {

  if (
    !gameRunning ||
    paused
  ) {

    return;
  }


  player.x +=
    player.speed;


  if (
    player.x +
      player.width >
    road.x +
      road.width
  ) {

    player.x =
      road.x +
      road.width -
      player.width;
  }
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "ArrowLeft"
    ) {

      moveLeft();
    }


    if (
      event.key ===
      "ArrowRight"
    ) {

      moveRight();
    }


    if (
      event.key ===
      " "
    ) {

      togglePause();
    }
  }
);


/* =========================
   MOBILE
========================= */

leftButton.addEventListener(
  "touchstart",
  event => {

    event.preventDefault();

    moveLeft();
  }
);


rightButton.addEventListener(
  "touchstart",
  event => {

    event.preventDefault();

    moveRight();
  }
);


leftButton.addEventListener(
  "click",
  moveLeft
);


rightButton.addEventListener(
  "click",
  moveRight
);


/* =========================
   GAME BUTTON
========================= */

startButton.addEventListener(
  "click",
  () => {

    if (
      startButton.textContent ===
      "BACK TO MENU"
    ) {

      backToMenu();

      return;
    }


    if (
      !gameRunning
    ) {

      startGame();

    } else {

      togglePause();
    }
  }
);


/* =========================
   SPAWN ENEMIES
========================= */

setInterval(
  () => {

    if (
      gameRunning &&
      !paused
    ) {

      createEnemy();
    }

  },
  1000
);


/* =========================
   SPAWN COINS
========================= */

setInterval(
  () => {

    if (
      gameRunning &&
      !paused
    ) {

      createCoin();
    }

  },
  1200
);
