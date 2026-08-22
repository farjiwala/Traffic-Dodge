const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const startButton = document.getElementById("startButton");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");

let player;
let enemies;
let score;
let gameRunning;
let animationId;
let roadOffset = 0;

const road = {
  x: 50,
  width: 300
};

function resetGame() {
  player = {
    x: 175,
    y: 500,
    width: 50,
    height: 80,
    speed: 7
  };

  enemies = [];
  score = 0;
  roadOffset = 0;
  gameRunning = true;

  scoreText.textContent = score;
}

function drawRoad() {
  // Road
  ctx.fillStyle = "#555";
  ctx.fillRect(road.x, 0, road.width, canvas.height);

  // Grass / roadside
  ctx.fillStyle = "#174d25";
  ctx.fillRect(0, 0, road.x, canvas.height);
  ctx.fillRect(
    road.x + road.width,
    0,
    canvas.width - road.x - road.width,
    canvas.height
  );

  // Road edges
  ctx.fillStyle = "#eee";
  ctx.fillRect(road.x, 0, 5, canvas.height);
  ctx.fillRect(road.x + road.width - 5, 0, 5, canvas.height);

  // Moving lane lines
  roadOffset += 8;

  if (roadOffset >= 60) {
    roadOffset = 0;
  }

  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.setLineDash([30, 30]);
  ctx.lineDashOffset = roadOffset;

  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(150, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(250, canvas.height);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // Roadside trees
  drawTrees();
}

function drawTrees() {
  const treePositions = [80, 320];

  treePositions.forEach(x => {
    for (let y = -50; y < canvas.height; y += 120) {
      const adjustedY = (y + roadOffset * 2) % 700 - 50;

      // Tree trunk
      ctx.fillStyle = "#795548";
      ctx.fillRect(x - 5, adjustedY + 25, 10, 25);

      // Tree leaves
      ctx.fillStyle = "#2e7d32";
      ctx.beginPath();
      ctx.arc(x, adjustedY + 20, 22, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawPlayer() {
  // Main car body
  ctx.fillStyle = "#1976d2";

  ctx.fillRect(
    player.x,
    player.y,
    player.width,
    player.height
  );

  // Car roof
  ctx.fillStyle = "#1565c0";

  ctx.fillRect(
    player.x + 7,
    player.y + 8,
    player.width - 14,
    48
  );

  // Windows
  ctx.fillStyle = "#b3e5fc";

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

  // Wheels
  ctx.fillStyle = "#111";

  ctx.fillRect(
    player.x - 5,
    player.y + 10,
    8,
    22
  );

  ctx.fillRect(
    player.x + player.width - 3,
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
    player.x + player.width - 3,
    player.y + 50,
    8,
    22
  );

  // Headlights
  ctx.fillStyle = "#fff59d";

  ctx.fillRect(
    player.x + 6,
    player.y + 2,
    10,
    6
  );

  ctx.fillRect(
    player.x + player.width - 16,
    player.y + 2,
    10,
    6
  );
}

function createEnemy() {
  const lanes = [75, 175, 275];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];

  const colors = [
    "#e53935",
    "#43a047",
    "#8e24aa",
    "#fb8c00"
  ];

  enemies.push({
    x: lane,
    y: -90,
    width: 50,
    height: 80,
    speed: 4 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)]
  });
}

function drawEnemies() {
  enemies.forEach(enemy => {
    // Main body
    ctx.fillStyle = enemy.color;

    ctx.fillRect(
      enemy.x,
      enemy.y,
      enemy.width,
      enemy.height
    );

    // Roof
    ctx.fillStyle = "#222";

    ctx.fillRect(
      enemy.x + 7,
      enemy.y + 8,
      enemy.width - 14,
      48
    );

    // Windows
    ctx.fillStyle = "#b3e5fc";

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

    // Wheels
    ctx.fillStyle = "#111";

    ctx.fillRect(
      enemy.x - 5,
      enemy.y + 10,
      8,
      22
    );

    ctx.fillRect(
      enemy.x + enemy.width - 3,
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
      enemy.x + enemy.width - 3,
      enemy.y + 50,
      8,
      22
    );
  });
}

function updateEnemies() {
  enemies.forEach(enemy => {
    enemy.y += enemy.speed;
  });

  enemies = enemies.filter(enemy => {
    if (enemy.y > canvas.height) {
      score++;
      scoreText.textContent = score;
      return false;
    }

    return true;
  });
}

function checkCollision() {
  for (const enemy of enemies) {
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      endGame();
      return;
    }
  }
}

function endGame() {
  gameRunning = false;

  cancelAnimationFrame(animationId);

  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "40px Arial";
  ctx.fillText(
    "GAME OVER",
    canvas.width / 2,
    270
  );

  ctx.font = "24px Arial";
  ctx.fillText(
    `Score: ${score}`,
    canvas.width / 2,
    320
  );

  startButton.textContent = "PLAY AGAIN";
}

function gameLoop() {
  if (!gameRunning) {
    return;
  }

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawRoad();
  updateEnemies();
  drawEnemies();
  drawPlayer();
  checkCollision();

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  cancelAnimationFrame(animationId);

  resetGame();

  startButton.textContent = "RESTART";

  gameLoop();
}

function moveLeft() {
  if (!gameRunning) {
    return;
  }

  player.x -= player.speed;

  if (player.x < road.x) {
    player.x = road.x;
  }
}

function moveRight() {
  if (!gameRunning) {
    return;
  }

  player.x += player.speed;

  if (player.x + player.width > road.x + road.width) {
    player.x = road.x + road.width - player.width;
  }
}

// Keyboard controls
document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") {
    moveLeft();
  }

  if (event.key === "ArrowRight") {
    moveRight();
  }
});

// Mobile controls
leftButton.addEventListener("touchstart", moveLeft);
rightButton.addEventListener("touchstart", moveRight);

leftButton.addEventListener("click", moveLeft);
rightButton.addEventListener("click", moveRight);

// Start button
startButton.addEventListener("click", startGame);

// Create enemies
setInterval(() => {
  if (gameRunning) {
    createEnemy();
  }
}, 1000);
