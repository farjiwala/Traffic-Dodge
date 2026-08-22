const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const startButton = document.getElementById("startButton");

let player;
let enemies;
let score;
let gameRunning;
let animationId;

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
  gameRunning = true;

  scoreText.textContent = score;
}

function drawRoad() {
  ctx.fillStyle = "#555";
  ctx.fillRect(road.x, 0, road.width, canvas.height);

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, road.x, canvas.height);
  ctx.fillRect(
    road.x + road.width,
    0,
    canvas.width - road.x - road.width,
    canvas.height
  );

  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.setLineDash([30, 30]);

  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(150, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(250, canvas.height);
  ctx.stroke();

  ctx.setLineDash([]);
}

function drawPlayer() {
  ctx.fillStyle = "#2196f3";
  ctx.fillRect(
    player.x,
    player.y,
    player.width,
    player.height
  );

  ctx.fillStyle = "#90caf9";
  ctx.fillRect(
    player.x + 10,
    player.y + 10,
    player.width - 20,
    25
  );

  ctx.fillStyle = "#111";
  ctx.fillRect(
    player.x + 5,
    player.y + 15,
    7,
    20
  );

  ctx.fillRect(
    player.x + player.width - 12,
    player.y + 15,
    7,
    20
  );
}

function createEnemy() {
  const lanes = [75, 175, 275];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];

  enemies.push({
    x: lane,
    y: -90,
    width: 50,
    height: 80,
    speed: 4 + Math.random() * 2
  });
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.fillStyle = "#e53935";

    ctx.fillRect(
      enemy.x,
      enemy.y,
      enemy.width,
      enemy.height
    );

    ctx.fillStyle = "#ffcdd2";

    ctx.fillRect(
      enemy.x + 10,
      enemy.y + 10,
      enemy.width - 20,
      25
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
    }
  }
}

function endGame() {
  gameRunning = false;

  cancelAnimationFrame(animationId);

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "40px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2, 270);

  ctx.font = "24px Arial";
  ctx.fillText(
    `Score: ${score}`,
    canvas.width / 2,
    320
  );

  startButton.textContent = "PLAY AGAIN";
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

document.addEventListener("keydown", event => {
  if (!gameRunning) return;

  if (event.key === "ArrowLeft") {
    player.x -= player.speed;
  }

  if (event.key === "ArrowRight") {
    player.x += player.speed;
  }

  if (player.x < road.x) {
    player.x = road.x;
  }

  if (player.x + player.width > road.x + road.width) {
    player.x = road.x + road.width - player.width;
  }
});

setInterval(() => {
  if (gameRunning) {
    createEnemy();
  }
}, 1000);

startButton.addEventListener("click", startGame);
