/**
 * Snake Game Implementation
 */

class SnakeGame {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;

    // Game state
    this.snake = [];
    this.food = {};
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.gameLoop = null;
    this.isPaused = false;
    this.isGameOver = false;
    this.gameSpeed = 100;
    this.minGameSpeed = 50;

    // Statistics
    this.stats = this.loadStats();

    // Initialize
    this.initGame();
    this.setupControls();
    this.updateUI();
  }

  initGame() {
    // Reset snake to center
    const centerX = Math.floor(this.tileCount / 2);
    const centerY = Math.floor(this.tileCount / 2);

    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];

    // Reset direction
    this.dx = 1;
    this.dy = 0;

    // Reset game state
    this.score = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.gameSpeed = 100;

    // Place first food
    this.placeFood();

    // Draw initial state
    this.draw();
  }

  placeFood() {
    let foodPlaced = false;

    while (!foodPlaced) {
      this.food = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount),
      };

      // Make sure food isn't on snake
      foodPlaced = !this.snake.some(
        (segment) => segment.x === this.food.x && segment.y === this.food.y,
      );
    }
  }

  setupControls() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (this.isGameOver) return;

      // Prevent default for arrow keys and WASD
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "w",
          "a",
          "s",
          "d",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (this.dy === 0) {
            this.dx = 0;
            this.dy = -1;
          }
          break;
        case "ArrowDown":
        case "s":
          if (this.dy === 0) {
            this.dx = 0;
            this.dy = 1;
          }
          break;
        case "ArrowLeft":
        case "a":
          if (this.dx === 0) {
            this.dx = -1;
            this.dy = 0;
          }
          break;
        case "ArrowRight":
        case "d":
          if (this.dx === 0) {
            this.dx = 1;
            this.dy = 0;
          }
          break;
      }
    });

    // Button controls
    document
      .getElementById("start-button")
      .addEventListener("click", () => this.start());
    document
      .getElementById("pause-button")
      .addEventListener("click", () => this.togglePause());
    document
      .getElementById("reset-button")
      .addEventListener("click", () => this.reset());
    document
      .getElementById("play-again-button")
      .addEventListener("click", () => {
        document.getElementById("game-over").style.display = "none";
        this.reset();
        this.start();
      });
  }

  start() {
    if (this.gameLoop || this.isGameOver) return;

    document.getElementById("start-button").disabled = true;
    document.getElementById("pause-button").disabled = false;

    this.gameLoop = setInterval(() => {
      if (!this.isPaused) {
        this.update();
        this.draw();
      }
    }, this.gameSpeed);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseButton = document.getElementById("pause-button");
    pauseButton.textContent = this.isPaused ? "Resume" : "Pause";
  }

  reset() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    document.getElementById("start-button").disabled = false;
    document.getElementById("pause-button").disabled = true;
    document.getElementById("pause-button").textContent = "Pause";
    document.getElementById("game-over").style.display = "none";

    this.initGame();
    this.updateUI();
  }

  update() {
    // Move snake
    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      this.gameOver();
      return;
    }

    // Check self collision
    if (
      this.snake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      this.gameOver();
      return;
    }

    // Add new head
    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.placeFood();

      // Increase speed (up to a minimum interval)
      if (this.gameSpeed > this.minGameSpeed) {
        this.gameSpeed = Math.max(this.minGameSpeed, this.gameSpeed - 2);
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
          if (!this.isPaused) {
            this.update();
            this.draw();
          }
        }, this.gameSpeed);
      }
    } else {
      // Remove tail if no food eaten
      this.snake.pop();
    }

    this.updateUI();
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = "#2a2a2a";
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }

    // Draw snake
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Head - brighter
        this.ctx.fillStyle = "#667eea";
      } else {
        // Body - gradient effect
        const alpha = 1 - (index / this.snake.length) * 0.5;
        this.ctx.fillStyle = `rgba(102, 126, 234, ${alpha})`;
      }

      this.ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2,
      );

      // Add eyes to head
      if (index === 0) {
        this.ctx.fillStyle = "white";
        const eyeSize = 3;
        const eyeOffset = 5;

        if (this.dx !== 0) {
          // Moving horizontally
          this.ctx.fillRect(
            segment.x * this.gridSize +
              (this.dx > 0 ? this.gridSize - eyeOffset : eyeOffset - eyeSize),
            segment.y * this.gridSize + 5,
            eyeSize,
            eyeSize,
          );
          this.ctx.fillRect(
            segment.x * this.gridSize +
              (this.dx > 0 ? this.gridSize - eyeOffset : eyeOffset - eyeSize),
            segment.y * this.gridSize + this.gridSize - 8,
            eyeSize,
            eyeSize,
          );
        } else {
          // Moving vertically
          this.ctx.fillRect(
            segment.x * this.gridSize + 5,
            segment.y * this.gridSize +
              (this.dy > 0 ? this.gridSize - eyeOffset : eyeOffset - eyeSize),
            eyeSize,
            eyeSize,
          );
          this.ctx.fillRect(
            segment.x * this.gridSize + this.gridSize - 8,
            segment.y * this.gridSize +
              (this.dy > 0 ? this.gridSize - eyeOffset : eyeOffset - eyeSize),
            eyeSize,
            eyeSize,
          );
        }
      }
    });

    // Draw food with pulsing effect
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    this.ctx.fillStyle = `rgba(231, 76, 60, ${pulse})`;
    this.ctx.fillRect(
      this.food.x * this.gridSize + 2,
      this.food.y * this.gridSize + 2,
      this.gridSize - 4,
      this.gridSize - 4,
    );

    // Add shine to food
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.fillRect(
      this.food.x * this.gridSize + 4,
      this.food.y * this.gridSize + 4,
      this.gridSize / 2,
      this.gridSize / 2,
    );
  }

  gameOver() {
    this.isGameOver = true;
    clearInterval(this.gameLoop);
    this.gameLoop = null;

    // Update statistics
    this.stats.gamesPlayed++;
    this.stats.totalScore += this.score;
    if (this.score > this.stats.highScore) {
      this.stats.highScore = this.score;
    }
    this.saveStats();

    // Show game over screen
    document.getElementById("final-score").textContent = this.score;
    document.getElementById("game-over").style.display = "flex";

    document.getElementById("start-button").disabled = false;
    document.getElementById("pause-button").disabled = true;

    this.updateUI();
  }

  updateUI() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("high-score").textContent = this.stats.highScore;
    document.getElementById("games-played").textContent =
      this.stats.gamesPlayed;
    document.getElementById("best-score").textContent = this.stats.highScore;

    const avgScore =
      this.stats.gamesPlayed > 0
        ? Math.round(this.stats.totalScore / this.stats.gamesPlayed)
        : 0;
    document.getElementById("avg-score").textContent = avgScore;
  }

  loadStats() {
    const saved = localStorage.getItem("snakeGameStats");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      gamesPlayed: 0,
      highScore: 0,
      totalScore: 0,
    };
  }

  saveStats() {
    localStorage.setItem("snakeGameStats", JSON.stringify(this.stats));
  }
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", () => {
  new SnakeGame();
});
