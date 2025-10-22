/**
 * Tests for TaskManager
 */

import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import TaskManager from "./taskManager.js";

describe("TaskManager", () => {
  let manager;

  beforeEach(() => {
    manager = new TaskManager();
  });

  describe("addTask", () => {
    test("should add a task with title and priority", () => {
      const task = manager.addTask("Test task", "high");

      assert.strictEqual(task.title, "Test task");
      assert.strictEqual(task.priority, "high");
      assert.strictEqual(task.completed, false);
      assert.strictEqual(task.id, 1);
    });

    test("should use default priority if not specified", () => {
      const task = manager.addTask("Test task");
      assert.strictEqual(task.priority, "medium");
    });

    test("should trim whitespace from title", () => {
      const task = manager.addTask("  Test task  ");
      assert.strictEqual(task.title, "Test task");
    });

    test("should throw error for empty title", () => {
      assert.throws(() => manager.addTask(""), /Task title is required/);
    });

    test("should throw error for invalid priority", () => {
      assert.throws(
        () => manager.addTask("Test", "urgent"),
        /Priority must be one of/,
      );
    });

    test("should increment IDs for multiple tasks", () => {
      const task1 = manager.addTask("Task 1");
      const task2 = manager.addTask("Task 2");
      const task3 = manager.addTask("Task 3");

      assert.strictEqual(task1.id, 1);
      assert.strictEqual(task2.id, 2);
      assert.strictEqual(task3.id, 3);
    });
  });

  describe("getTask", () => {
    test("should return task by ID", () => {
      const created = manager.addTask("Test task");
      const found = manager.getTask(created.id);

      assert.deepStrictEqual(found, created);
    });

    test("should return null for non-existent ID", () => {
      const found = manager.getTask(999);
      assert.strictEqual(found, null);
    });
  });

  describe("getTasks", () => {
    beforeEach(() => {
      manager.addTask("High priority task", "high");
      manager.addTask("Medium priority task", "medium");
      manager.addTask("Low priority task", "low");
      manager.completeTask(1);
    });

    test("should return all tasks when no filters", () => {
      const tasks = manager.getTasks();
      assert.strictEqual(tasks.length, 3);
    });

    test("should filter by completed status", () => {
      const completed = manager.getTasks({ completed: true });
      const pending = manager.getTasks({ completed: false });

      assert.strictEqual(completed.length, 1);
      assert.strictEqual(pending.length, 2);
    });

    test("should filter by priority", () => {
      const highPriority = manager.getTasks({ priority: "high" });
      assert.strictEqual(highPriority.length, 1);
      assert.strictEqual(highPriority[0].priority, "high");
    });

    test("should filter by multiple criteria", () => {
      const filtered = manager.getTasks({
        completed: false,
        priority: "medium",
      });
      assert.strictEqual(filtered.length, 1);
    });
  });

  describe("updateTask", () => {
    test("should update task title", () => {
      const task = manager.addTask("Original title");
      const updated = manager.updateTask(task.id, { title: "New title" });

      assert.strictEqual(updated.title, "New title");
    });

    test("should update task priority", () => {
      const task = manager.addTask("Test task", "low");
      const updated = manager.updateTask(task.id, { priority: "high" });

      assert.strictEqual(updated.priority, "high");
    });

    test("should update completed status", () => {
      const task = manager.addTask("Test task");
      const updated = manager.updateTask(task.id, { completed: true });

      assert.strictEqual(updated.completed, true);
    });

    test("should return null for non-existent task", () => {
      const updated = manager.updateTask(999, { title: "New" });
      assert.strictEqual(updated, null);
    });

    test("should throw error for invalid title", () => {
      const task = manager.addTask("Test task");
      assert.throws(
        () => manager.updateTask(task.id, { title: "" }),
        /Title must be a non-empty string/,
      );
    });
  });

  describe("completeTask", () => {
    test("should mark task as completed", () => {
      const task = manager.addTask("Test task");
      const completed = manager.completeTask(task.id);

      assert.strictEqual(completed.completed, true);
    });

    test("should return null for non-existent task", () => {
      const result = manager.completeTask(999);
      assert.strictEqual(result, null);
    });
  });

  describe("deleteTask", () => {
    test("should delete existing task", () => {
      const task = manager.addTask("Test task");
      const deleted = manager.deleteTask(task.id);

      assert.strictEqual(deleted, true);
      assert.strictEqual(manager.getTasks().length, 0);
    });

    test("should return false for non-existent task", () => {
      const deleted = manager.deleteTask(999);
      assert.strictEqual(deleted, false);
    });
  });

  describe("getStats", () => {
    test("should return correct statistics", () => {
      manager.addTask("Task 1", "high");
      manager.addTask("Task 2", "high");
      manager.addTask("Task 3", "medium");
      manager.addTask("Task 4", "low");
      manager.completeTask(1);
      manager.completeTask(2);

      const stats = manager.getStats();

      assert.strictEqual(stats.total, 4);
      assert.strictEqual(stats.completed, 2);
      assert.strictEqual(stats.pending, 2);
      assert.strictEqual(stats.byPriority.high, 2);
      assert.strictEqual(stats.byPriority.medium, 1);
      assert.strictEqual(stats.byPriority.low, 1);
    });

    test("should return zeros for empty task list", () => {
      const stats = manager.getStats();

      assert.strictEqual(stats.total, 0);
      assert.strictEqual(stats.completed, 0);
      assert.strictEqual(stats.pending, 0);
    });
  });

  describe("clearAllTasks", () => {
    test("should remove all tasks and reset ID counter", () => {
      manager.addTask("Task 1");
      manager.addTask("Task 2");
      manager.clearAllTasks();

      assert.strictEqual(manager.getTasks().length, 0);

      const newTask = manager.addTask("New task");
      assert.strictEqual(newTask.id, 1);
    });
  });
});
