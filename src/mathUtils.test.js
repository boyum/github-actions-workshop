/**
 * Tests for mathUtils
 */

import assert from "node:assert";
import { describe, test } from "node:test";
import { average, isPrime, max, min, sum } from "./mathUtils.js";

describe("mathUtils", () => {
  describe("sum", () => {
    test("should sum an array of numbers", () => {
      assert.strictEqual(sum([1, 2, 3, 4, 5]), 15);
      assert.strictEqual(sum([10, 20, 30]), 60);
    });

    test("should handle empty array", () => {
      assert.strictEqual(sum([]), 0);
    });

    test("should handle negative numbers", () => {
      assert.strictEqual(sum([-1, -2, -3]), -6);
      assert.strictEqual(sum([1, -1, 2, -2]), 0);
    });

    test("should throw TypeError for non-array input", () => {
      assert.throws(() => sum(123), TypeError);
      assert.throws(() => sum("123"), TypeError);
    });

    test("should throw TypeError for non-numeric elements", () => {
      assert.throws(() => sum([1, 2, "3"]), TypeError);
    });
  });

  describe("average", () => {
    test("should calculate average of numbers", () => {
      assert.strictEqual(average([1, 2, 3, 4, 5]), 3);
      assert.strictEqual(average([10, 20, 30]), 20);
    });

    test("should handle negative numbers", () => {
      assert.strictEqual(average([-1, -2, -3]), -2);
    });

    test("should handle decimals", () => {
      assert.strictEqual(average([1, 2, 3]), 2);
    });

    test("should throw Error for empty array", () => {
      assert.throws(() => average([]), Error);
    });

    test("should throw TypeError for non-array input", () => {
      assert.throws(() => average(123), TypeError);
    });
  });

  describe("max", () => {
    test("should find maximum value", () => {
      assert.strictEqual(max([1, 2, 3, 4, 5]), 5);
      assert.strictEqual(max([10, 5, 20, 15]), 20);
    });

    test("should handle negative numbers", () => {
      assert.strictEqual(max([-1, -2, -3]), -1);
    });

    test("should handle single element", () => {
      assert.strictEqual(max([42]), 42);
    });

    test("should throw Error for empty array", () => {
      assert.throws(() => max([]), Error);
    });

    test("should throw TypeError for non-array input", () => {
      assert.throws(() => max(123), TypeError);
    });
  });

  describe("min", () => {
    test("should find minimum value", () => {
      assert.strictEqual(min([1, 2, 3, 4, 5]), 1);
      assert.strictEqual(min([10, 5, 20, 15]), 5);
    });

    test("should handle negative numbers", () => {
      assert.strictEqual(min([-1, -2, -3]), -3);
    });

    test("should handle single element", () => {
      assert.strictEqual(min([42]), 42);
    });

    test("should throw Error for empty array", () => {
      assert.throws(() => min([]), Error);
    });

    test("should throw TypeError for non-array input", () => {
      assert.throws(() => min(123), TypeError);
    });
  });

  describe("isPrime", () => {
    test("should return true for prime numbers", () => {
      assert.strictEqual(isPrime(2), true);
      assert.strictEqual(isPrime(3), true);
      assert.strictEqual(isPrime(5), true);
      assert.strictEqual(isPrime(7), true);
      assert.strictEqual(isPrime(11), true);
      assert.strictEqual(isPrime(13), true);
    });

    test("should return false for non-prime numbers", () => {
      assert.strictEqual(isPrime(1), false);
      assert.strictEqual(isPrime(4), false);
      assert.strictEqual(isPrime(6), false);
      assert.strictEqual(isPrime(8), false);
      assert.strictEqual(isPrime(9), false);
      assert.strictEqual(isPrime(10), false);
    });

    test("should return false for negative numbers", () => {
      assert.strictEqual(isPrime(-1), false);
      assert.strictEqual(isPrime(-5), false);
    });

    test("should return false for zero", () => {
      assert.strictEqual(isPrime(0), false);
    });

    test("should return false for decimals", () => {
      assert.strictEqual(isPrime(2.5), false);
      assert.strictEqual(isPrime(3.14), false);
    });

    test("should throw TypeError for non-number input", () => {
      assert.throws(() => isPrime("5"), TypeError);
      assert.throws(() => isPrime(null), TypeError);
    });
  });
});
