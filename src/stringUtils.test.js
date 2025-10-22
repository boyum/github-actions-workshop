/**
 * Tests for stringUtils
 */

import assert from "node:assert";
import { describe, test } from "node:test";
import { capitalize, isPalindrome, reverse, truncate } from "./stringUtils.js";

describe("stringUtils", () => {
  describe("capitalize", () => {
    test("should capitalize the first letter", () => {
      assert.strictEqual(capitalize("hello"), "Hello");
      assert.strictEqual(capitalize("world"), "World");
    });

    test("should handle already capitalized strings", () => {
      assert.strictEqual(capitalize("Hello"), "Hello");
    });

    test("should handle empty strings", () => {
      assert.strictEqual(capitalize(""), "");
    });

    test("should handle single character", () => {
      assert.strictEqual(capitalize("a"), "A");
    });

    test("should throw TypeError for non-string input", () => {
      assert.throws(() => capitalize(123), TypeError);
      assert.throws(() => capitalize(null), TypeError);
    });
  });

  describe("reverse", () => {
    test("should reverse a string", () => {
      assert.strictEqual(reverse("hello"), "olleh");
      assert.strictEqual(reverse("world"), "dlrow");
    });

    test("should handle empty strings", () => {
      assert.strictEqual(reverse(""), "");
    });

    test("should handle palindromes", () => {
      assert.strictEqual(reverse("racecar"), "racecar");
    });

    test("should throw TypeError for non-string input", () => {
      assert.throws(() => reverse(123), TypeError);
    });
  });

  describe("isPalindrome", () => {
    test("should return true for palindromes", () => {
      assert.strictEqual(isPalindrome("racecar"), true);
      assert.strictEqual(isPalindrome("A man a plan a canal Panama"), true);
      assert.strictEqual(isPalindrome("Was it a car or a cat I saw"), true);
    });

    test("should return false for non-palindromes", () => {
      assert.strictEqual(isPalindrome("hello"), false);
      assert.strictEqual(isPalindrome("world"), false);
    });

    test("should handle empty strings", () => {
      assert.strictEqual(isPalindrome(""), true);
    });

    test("should handle single characters", () => {
      assert.strictEqual(isPalindrome("a"), true);
    });

    test("should throw TypeError for non-string input", () => {
      assert.throws(() => isPalindrome(123), TypeError);
    });
  });

  describe("truncate", () => {
    test("should truncate long strings", () => {
      assert.strictEqual(truncate("Hello World", 5), "Hello...");
      assert.strictEqual(
        truncate("This is a long string", 10),
        "This is a ...",
      );
    });

    test("should not truncate short strings", () => {
      assert.strictEqual(truncate("Hello", 10), "Hello");
      assert.strictEqual(truncate("Hi", 5), "Hi");
    });

    test("should handle exact length", () => {
      assert.strictEqual(truncate("Hello", 5), "Hello");
    });

    test("should handle empty strings", () => {
      assert.strictEqual(truncate("", 5), "");
    });

    test("should throw TypeError for invalid inputs", () => {
      assert.throws(() => truncate(123, 5), TypeError);
      assert.throws(() => truncate("hello", "5"), TypeError);
      assert.throws(() => truncate("hello", -1), TypeError);
    });
  });
});
