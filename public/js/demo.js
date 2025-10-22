/**
 * Demo page JavaScript
 */

function testStringUtils() {
  const input = document.getElementById("string-input").value;
  const output = document.getElementById("string-output");

  if (!input) {
    output.textContent = "Please enter some text!";
    return;
  }

  try {
    const results = [
      `Original: "${input}"`,
      `Capitalized: "${capitalize(input)}"`,
      `Reversed: "${reverse(input)}"`,
      `Is palindrome: ${isPalindrome(input)}`,
      `Truncated (10 chars): "${truncate(input, 10)}"`,
    ];

    output.textContent = results.join("\n");
  } catch (error) {
    output.textContent = `Error: ${error.message}`;
  }
}

function testMathUtils() {
  const input = document.getElementById("numbers-input").value;
  const output = document.getElementById("math-output");

  if (!input) {
    output.textContent = "Please enter some numbers!";
    return;
  }

  try {
    const numbers = input.split(",").map((n) => parseFloat(n.trim()));

    if (numbers.some(isNaN)) {
      throw new Error("All values must be valid numbers");
    }

    const results = [
      `Numbers: [${numbers.join(", ")}]`,
      `Sum: ${sum(numbers)}`,
      `Average: ${average(numbers)}`,
      `Max: ${max(numbers)}`,
      `Min: ${min(numbers)}`,
      `Prime numbers: ${numbers.filter(isPrime).join(", ") || "none"}`,
    ];

    output.textContent = results.join("\n");
  } catch (error) {
    output.textContent = `Error: ${error.message}`;
  }
}

// String utility functions (simplified versions for browser)
function capitalize(str) {
  if (typeof str !== "string") throw new TypeError("Input must be a string");
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function reverse(str) {
  if (typeof str !== "string") throw new TypeError("Input must be a string");
  return str.split("").reverse().join("");
}

function isPalindrome(str) {
  if (typeof str !== "string") throw new TypeError("Input must be a string");
  const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalized === normalized.split("").reverse().join("");
}

function truncate(str, maxLength) {
  if (typeof str !== "string") throw new TypeError("Input must be a string");
  if (typeof maxLength !== "number" || maxLength < 0) {
    throw new TypeError("maxLength must be a non-negative number");
  }
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

// Math utility functions (simplified versions for browser)
function sum(numbers) {
  if (!Array.isArray(numbers)) throw new TypeError("Input must be an array");
  return numbers.reduce((acc, num) => {
    if (typeof num !== "number")
      throw new TypeError("All elements must be numbers");
    return acc + num;
  }, 0);
}

function average(numbers) {
  if (!Array.isArray(numbers)) throw new TypeError("Input must be an array");
  if (numbers.length === 0) throw new Error("Array cannot be empty");
  return sum(numbers) / numbers.length;
}

function max(numbers) {
  if (!Array.isArray(numbers)) throw new TypeError("Input must be an array");
  if (numbers.length === 0) throw new Error("Array cannot be empty");
  return Math.max(...numbers);
}

function min(numbers) {
  if (!Array.isArray(numbers)) throw new TypeError("Input must be an array");
  if (numbers.length === 0) throw new Error("Array cannot be empty");
  return Math.min(...numbers);
}

function isPrime(num) {
  if (typeof num !== "number") throw new TypeError("Input must be a number");
  if (num < 2 || !Number.isInteger(num)) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}
