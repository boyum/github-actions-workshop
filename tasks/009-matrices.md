# Lesson 8: Matrices

## The Story: The Copy-Paste Nightmare

Imagine you're maintaining a popular open-source library. One day, a user reports that your library doesn't work on
Node.js version 18. Another user complains it fails on Windows. A third mentions issues on macOS with Node 20.

You think, "No problem! I'll just add more test jobs to my workflow." So you start writing:

```yaml
jobs:
  test-node-18:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm test

  test-node-20:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm test

  test-node-22:
    runs-on: ubuntu-latest
    # ... and so on ...
```

But wait, you also need to test on Windows and macOS! That's 3 Node versions × 3 operating systems = 9 nearly identical
jobs. And if you need to update one step, you'll have to change it in 9 places. There has to be a better way...

**Enter matrix builds!** 🎯

## What Are Matrix Builds?

Matrix builds allow you to automatically create multiple job variations by defining variables that get combined in
different ways. Instead of writing 9 separate jobs, you define the dimensions you want to test (Node versions and
operating systems), and GitHub Actions creates all the combinations for you.

Think of it like a spreadsheet table where:

- Rows represent one variable (e.g., Node versions: 18, 20, 22)
- Columns represent another variable (e.g., OS: Ubuntu, Windows, macOS)
- Each cell in the table becomes a separate job

## Basic Matrix Syntax

Here's a simple matrix example:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm install
      - run: npm test
```

This single job definition will create **9 jobs** (3 OS × 3 Node versions), each running in parallel!

The `${{ matrix.os }}` and `${{ matrix.node-version }}` syntax accesses the current combination's values.

## When to Use Matrices

Matrix builds are perfect for:

- **Cross-platform testing**: Testing on Linux, Windows, and macOS
- **Multiple language versions**: Testing with different Node.js, Python, or Ruby versions
- **Different configurations**: Testing with different database versions, dependencies, or build flags
- **Browser testing**: Testing across Chrome, Firefox, Safari, and Edge

## Matrix Features

### Including Specific Combinations

Sometimes you want to add extra configurations:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18, 20]
    include:
      # Add a specific combination
      - os: macos-latest
        node-version: 22
```

### Excluding Specific Combinations

You might want to skip certain combinations:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [18, 20, 22]
    exclude:
      # Skip Windows with Node 18 because it has a known incompatibility we won't try to fix
      - os: windows-latest
        node-version: 18
```

### Fail-Fast Behavior

By default, if one matrix job fails, GitHub Actions cancels all other running matrix jobs. You can change this:

```yaml
strategy:
  fail-fast: false # Continue running other jobs even if one fails
  matrix:
    # ...
```

## Task: Add Matrix Testing to Your Project

Your task is to create a workflow that tests this project across multiple configurations.

**Requirements:**

1. Create a new workflow file `.github/workflows/matrix-test.yml`
2. The workflow should trigger on `pull_request` events, so remember to create a new branch and open a PR to test it
3. Use a matrix strategy to test on:
   - Operating systems: `ubuntu-latest`, `windows-latest`, `macos-latest`
   - Node.js versions: `18`, `20`, `22`
4. Each job should:
   - Check out the code
   - Set up the specified Node.js version
   - Install dependencies using `npm install`
   - Run tests using `npm test`
5. Set `fail-fast: false` so all combinations run even if one fails
6. Give each job a descriptive name that shows which OS and Node version it's using

**Bonus Challenge:**

- Exclude the combination of `macos-latest` with Node.js `18` (pretend there's a known compatibility issue)
- Add an extra test run on `ubuntu-latest` with Node.js `16` using the `include` feature

<details>
  <summary>Possible solution</summary>

```yaml
name: Matrix Testing

on:
  pull_request:

jobs:
  test:
    name: Test on ${{ matrix.os }} with Node ${{ matrix.node-version }}
    runs-on: ${{ matrix.os }}

    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]
        exclude:
          # Skip macOS with Node 18 due to known compatibility issue
          - os: macos-latest
            node-version: 18
        include:
          # Add extra test on Ubuntu with Node 16
          - os: ubuntu-latest
            node-version: 16

    steps:
      - name: Check out the code
        uses: actions/checkout@v5

      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test
```

This workflow will create 9 jobs total:

- 3 for ubuntu-latest (Node 16, 18, 20, 22) = 4 jobs
- 3 for windows-latest (Node 18, 20, 22) = 3 jobs
- 2 for macos-latest (Node 20, 22) = 2 jobs (Node 18 excluded)

Each job runs independently and in parallel, giving you comprehensive test coverage across platforms and Node versions!

</details>

## Summary

Matrix builds are a powerful way to test your code across multiple configurations without duplicating workflow code.
They save time, reduce errors, and make your workflows much easier to maintain.

In the next lesson, we'll explore strategies to speed up your workflows even further!

[Next Lesson: Lesson 10 - Speed Up Workflows](010-speed-up-workflows.md)
