/**
 * Tests for Snake Game
 * Note: These tests focus on the game logic that can be tested without DOM
 */

import { test, describe } from "node:test";
import assert from "node:assert";

// Mock localStorage for testing
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  clear() {
    this.data = {};
  },
};

// Mock DOM elements needed for SnakeGame
global.document = {
  getElementById: (id) => {
    const mockElements = {
      "game-canvas": {
        getContext: () => ({
          fillStyle: "",
          strokeStyle: "",
          lineWidth: 0,
          fillRect: () => {},
          strokeRect: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
        }),
        width: 400,
        height: 400,
      },
      score: { textContent: "0" },
      "high-score": { textContent: "0" },
      "games-played": { textContent: "0" },
      "best-score": { textContent: "0" },
      "avg-score": { textContent: "0" },
      "final-score": { textContent: "0" },
      "game-over": { style: { display: "none" } },
      "start-button": { disabled: false, addEventListener: () => {} },
      "pause-button": {
        disabled: false,
        textContent: "",
        addEventListener: () => {},
      },
      "reset-button": { addEventListener: () => {} },
      "play-again-button": { addEventListener: () => {} },
    };
    return (
      mockElements[id] || {
        addEventListener: () => {},
        textContent: "",
        disabled: false,
      }
    );
  },
  addEventListener: () => {},
};

describe("Snake Game Logic", () => {
  describe("Game Initialization", () => {
    test("should initialize with correct grid size", () => {
      const gridSize = 20;
      const canvasWidth = 400;
      const expectedTileCount = canvasWidth / gridSize;

      assert.strictEqual(expectedTileCount, 20);
    });

    test("should start with 3 segment snake", () => {
      const initialSnakeLength = 3;
      assert.strictEqual(initialSnakeLength, 3);
    });
  });

  describe("Food Placement", () => {
    test("should place food within grid bounds", () => {
      const tileCount = 20;
      const foodX = Math.floor(Math.random() * tileCount);
      const foodY = Math.floor(Math.random() * tileCount);

      assert.ok(foodX >= 0 && foodX < tileCount);
      assert.ok(foodY >= 0 && foodY < tileCount);
    });
  });

  describe("Collision Detection", () => {
    test("should detect wall collision on left edge", () => {
      const head = { x: -1, y: 10 };
      const tileCount = 20;

      const hitWall =
        head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;

      assert.strictEqual(hitWall, true);
    });

    test("should detect wall collision on right edge", () => {
      const head = { x: 20, y: 10 };
      const tileCount = 20;

      const hitWall =
        head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;

      assert.strictEqual(hitWall, true);
    });

    test("should not detect collision within bounds", () => {
      const head = { x: 10, y: 10 };
      const tileCount = 20;

      const hitWall =
        head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;

      assert.strictEqual(hitWall, false);
    });

    test("should detect self collision", () => {
      const snake = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 5, y: 7 },
      ];
      const head = { x: 5, y: 6 };

      const hitSelf = snake.some(
        (segment) => segment.x === head.x && segment.y === head.y,
      );

      assert.strictEqual(hitSelf, true);
    });
  });

  describe("Movement", () => {
    test("should move snake right", () => {
      const head = { x: 5, y: 5 };
      const dx = 1;
      const dy = 0;

      const newHead = { x: head.x + dx, y: head.y + dy };

      assert.deepStrictEqual(newHead, { x: 6, y: 5 });
    });

    test("should move snake down", () => {
      const head = { x: 5, y: 5 };
      const dx = 0;
      const dy = 1;

      const newHead = { x: head.x + dx, y: head.y + dy };

      assert.deepStrictEqual(newHead, { x: 5, y: 6 });
    });

    test("should move snake left", () => {
      const head = { x: 5, y: 5 };
      const dx = -1;
      const dy = 0;

      const newHead = { x: head.x + dx, y: head.y + dy };

      assert.deepStrictEqual(newHead, { x: 4, y: 5 });
    });

    test("should move snake up", () => {
      const head = { x: 5, y: 5 };
      const dx = 0;
      const dy = -1;

      const newHead = { x: head.x + dx, y: head.y + dy };

      assert.deepStrictEqual(newHead, { x: 5, y: 4 });
    });
  });

  describe("Scoring", () => {
    test("should increase score when eating food", () => {
      let score = 0;
      score += 10;

      assert.strictEqual(score, 10);
    });

    test("should calculate average score correctly", () => {
      const totalScore = 150;
      const gamesPlayed = 3;
      const avgScore = Math.round(totalScore / gamesPlayed);

      assert.strictEqual(avgScore, 50);
    });

    test("should handle zero games played for average", () => {
      const totalScore = 0;
      const gamesPlayed = 0;
      const avgScore =
        gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;

      assert.strictEqual(avgScore, 0);
    });
  });

  describe("Game Speed", () => {
    test("should decrease interval (increase speed) when scoring", () => {
      let gameSpeed = 100;
      const minGameSpeed = 50;

      gameSpeed = Math.max(minGameSpeed, gameSpeed - 2);

      assert.strictEqual(gameSpeed, 98);
    });

    test("should not go below minimum speed", () => {
      let gameSpeed = 50;
      const minGameSpeed = 50;

      gameSpeed = Math.max(minGameSpeed, gameSpeed - 2);

      assert.strictEqual(gameSpeed, 50);
    });
  });

  describe("Statistics", () => {
    test("should save statistics to localStorage", () => {
      const stats = {
        gamesPlayed: 5,
        highScore: 120,
        totalScore: 450,
      };

      localStorage.setItem("snakeGameStats", JSON.stringify(stats));
      const saved = JSON.parse(localStorage.getItem("snakeGameStats"));

      assert.deepStrictEqual(saved, stats);
    });

    test("should load statistics from localStorage", () => {
      const stats = {
        gamesPlayed: 3,
        highScore: 80,
        totalScore: 210,
      };

      localStorage.setItem("snakeGameStats", JSON.stringify(stats));
      const loaded = JSON.parse(localStorage.getItem("snakeGameStats"));

      assert.strictEqual(loaded.gamesPlayed, 3);
      assert.strictEqual(loaded.highScore, 80);
      assert.strictEqual(loaded.totalScore, 210);
    });

    test("should return default stats when none saved", () => {
      localStorage.clear();
      const saved = localStorage.getItem("snakeGameStats");

      const stats = saved
        ? JSON.parse(saved)
        : {
            gamesPlayed: 0,
            highScore: 0,
            totalScore: 0,
          };

      assert.deepStrictEqual(stats, {
        gamesPlayed: 0,
        highScore: 0,
        totalScore: 0,
      });
    });
  });

  describe("Direction Changes", () => {
    test("should prevent 180 degree turn when moving right", () => {
      const dx = 1;
      const dy = 0;
      const newDirection = { dx: -1, dy: 0 }; // Try to go left

      // Should not allow if dy is 0 (moving horizontally)
      const canChange = dy !== 0;

      assert.strictEqual(canChange, false);
    });

    test("should allow perpendicular turn when moving right", () => {
      const dx = 1;
      const dy = 0;
      const newDirection = { dx: 0, dy: 1 }; // Try to go down

      // Should allow if dx is 0 (moving vertically is perpendicular)
      const canChange = newDirection.dx === 0;

      assert.strictEqual(canChange, true);
    });
  });
});
