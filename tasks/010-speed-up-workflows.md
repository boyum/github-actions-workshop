# Lesson 10: Speeding Up Workflows

## The Story: The 15-Minute Wait

Marcus is a developer on a fast-moving team. Every time he pushes a commit to a pull request, he has to wait 8 minutes for the CI pipeline to complete. He starts the run, checks Slack, reads emails, and by the time he comes back, he's lost his train of thought.

Worse, when he realizes he made a typo and pushes a quick fix, the first run is still going. Now two workflows are running in parallel, both testing outdated code, wasting compute time and money.

The team lead points out that 40% of their workflow time is spent just downloading and installing npm packages. The tests themselves only take 90 seconds, but with setup time, the whole process drags on.

"There has to be a way to make this faster," Marcus thinks.

**Enter workflow optimization!**

## The Problem

Slow workflows have real costs:

- **Lost Productivity**: Developers context-switch while waiting for results
- **Wasted Resources**: Running outdated workflows costs money and compute time
- **Slower Iteration**: Long feedback loops discourage frequent commits
- **Bottlenecks**: Pull requests pile up waiting for CI to complete

The good news? Most workflows can be 50-70% faster with a few simple optimizations!

## Optimization 1: Dependency Caching

The single biggest speedup comes from caching dependencies. Instead of downloading packages every time, GitHub Actions can cache and reuse them.

### Before Caching

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          # No caching!

      - run: npm install # Downloads everything every time
      - run: npm test
```

Every run downloads all packages from npm. For a typical project, this takes 1-3 minutes.

### With Caching

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm" # -> Cache npm dependencies

      - run: npm install # Uses cache if available
      - run: npm test
```

**The `cache: 'npm'` line is magic!** It automatically:

1. Creates a cache key based on your `package-lock.json`
2. Saves `node_modules` after first run
3. Restores the cache on subsequent runs
4. Only re-downloads if `package-lock.json` changes

> [!TIP]
> The cache key is based on your lockfile hash. When dependencies change, the cache automatically invalidates and rebuilds!

### Manual Caching for More Control

For more complex caching needs, use the `actions/cache` action directly:

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- run: npm install
```

**Expected speedup**: 40-70% reduction in setup time!

## Optimization 2: Concurrency Control

When you push multiple commits to a PR, old workflow runs become irrelevant. Cancel them automatically!

### The Problem

```yaml
# User pushes commit A -> Workflow starts (8 min)
# User pushes commit B -> Another workflow starts (8 min)
# User pushes commit C -> Another workflow starts (8 min)
# Total: 24 minutes of compute time, but only the last run matters!
```

### The Solution

```yaml
name: PR Tests

on:
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true # Cancel old runs

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm test
```

**How it works**:

- `group`: Identifies related workflow runs (same workflow + same branch)
- `cancel-in-progress: true`: Cancels older runs when a new one starts

**When to use**:

- Pull request workflows - only latest code matters
- Development branches - fast iteration is key
- Main branch - you want all deployments to complete
- Release workflows - every release should finish

> [!NOTE]
> For main branch, use `cancel-in-progress: false` or conditionally enable it:
>
> ```yaml
> cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
> ```

## Optimization 3: Path Filters

Don't run tests when only documentation changes!

### Before Path Filters

Every commit triggers the full test suite, even for:

- README updates
- Documentation changes
- Comment additions
- Configuration tweaks

### With Path Filters

```yaml
name: Run Tests

on:
  pull_request:
    paths:
      - "src/**"
      - "tests/**"
      - "package.json"
      - "package-lock.json"
      # NOT: docs/**, *.md, or config files

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm test
```

Create a separate workflow for documentation:

```yaml
name: Docs Check

on:
  pull_request:
    paths:
      - "docs/**"
      - "**.md"

jobs:
  lint-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Check markdown files
        run: echo "Documentation looks good!"
```

**Expected speedup**: Documentation PRs go from 8 minutes to 10 seconds!

## Optimization 4: Build Once, Use Everywhere

We already covered this in Lesson 7 (Artifacts), but it's worth emphasizing: build artifacts once and reuse them!

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm install
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - run: npm test

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - run: ./deploy.sh
```

Build happens once, test and deploy use the same artifact. No redundant builds!

## Optimization 5: Conditional Steps

Skip expensive steps when they're not needed:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm install
      - run: npm test

      # Only run expensive E2E tests on main branch
      - name: E2E Tests
        if: github.ref == 'refs/heads/main'
        run: npm run test:e2e

      # Only deploy on main
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: ./deploy.sh
```

**Common conditions**:

```yaml
# Only on main branch
if: github.ref == 'refs/heads/main'

# Only on pull requests
if: github.event_name == 'pull_request'

# Only if previous step succeeded
if: success()

# Always run, even if previous steps failed
if: always()

# Only if specific files changed
if: contains(github.event.head_commit.modified, 'src/')
```

## Optimization 6: Timeouts

Prevent runaway jobs from consuming resources:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10 # Kill job if it runs too long
    steps:
      - uses: actions/checkout@v5
      - run: npm test
```

**Why it helps**:

- Catches infinite loops or hanging tests quickly
- Prevents wasting compute time on stuck jobs
- Provides faster feedback when something goes wrong

**Default timeout**: 360 minutes (6 hours) - way too long for most jobs!

## The Complete Optimized Workflow

Here's Marcus's workflow, fully optimized:

```yaml
name: Optimized CI

on:
  push:
    branches: [main]
  pull_request:
    paths:
      - "src/**"
      - "tests/**"
      - "package*.json"

# Cancel old PR runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

jobs:
  # Fast lint check runs first
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm install
      - run: npm run lint

  # Parallel test and build
  test:
    needs: lint
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm install
      - run: npm test

  build:
    needs: lint
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm install
      - run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7

  # Only deploy on main branch
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [test, build]
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - name: Deploy to production
        run: echo "Deploying to production..."
```

**Optimizations used**:

1. Dependency caching (`cache: 'npm'`)
2. Concurrency control (cancel old PR runs)
3. Path filters (only for code changes)
4. Parallel jobs (test and build run simultaneously)
5. Conditional deployment (only on main)
6. Timeouts (fail fast on hanging jobs)
7. Artifact reuse (build once)
8. Fast-fail strategy (lint first, then test/build)

## Performance Results

### Before Optimization

```text
Sequential workflow, no caching:
- Setup + Install: 2 min
- Lint: 1 min
- Test: 2 min
- Build: 2 min
Total: ~7 minutes per run
```

### After Optimization

```text
Parallel workflow with caching:
- Setup + Install (cached): 20 sec
- Lint: 1 min
- Test & Build (parallel): 2 min
Total: ~2.5 minutes per run
```

**Result: 64% faster!** (7 min -> 2.5 min)

Plus:

- Documentation PRs: 10 seconds instead of 7 minutes
- Cancelled runs save compute time on updated PRs
- Timeouts catch problems quickly

## Task: Optimize Your Workflow

Take one of your existing workflows and optimize it!

**Requirements:**

1. Add dependency caching using `cache: 'npm'`
2. Add concurrency control to cancel outdated PR runs
3. Add path filters to skip workflows for documentation changes
4. Add timeout limits to all jobs (appropriate durations)
5. Measure the improvement

**Steps:**

1. Pick an existing workflow (or use the one from Lesson 3)
2. Run it once and note the execution time
3. Apply optimizations one by one
4. Run again and compare execution times
5. Calculate the percentage improvement

**Bonus Challenge:**

- Create a comparison table showing before/after times for each optimization
- Add conditional deployment that only runs on the main branch
- Experiment with parallelizing independent jobs

<details>
  <summary>Possible solution</summary>

Starting with a basic workflow:

```yaml
name: Basic CI

on:
  push:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm test
      - run: npm run build
```

Optimized version:

```yaml
name: Optimized CI

on:
  push:
    branches: [main]
  pull_request:
    paths:
      - "src/**"
      - "tests/**"
      - "**.js"
      - "package*.json"

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm install
      - run: npm test

  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm install
      - run: npm run build

      - uses: actions/upload-artifact@v4
        if: github.ref == 'refs/heads/main'
        with:
          name: dist
          path: dist/
```

**Performance comparison:**

| Optimization          | Time   | Savings |
| --------------------- | ------ | ------- |
| Baseline              | 5:30   | -       |
| + Caching             | 3:45   | 32%     |
| + Parallelization     | 2:30   | 33%     |
| + Path filters        | 0:15\* | 94%\*   |
| + Concurrency control | 2:30   | saves $ |

\*For documentation-only changes

**Total improvement: 55% faster** (5:30 -> 2:30) for code changes, and documentation changes complete in seconds instead of minutes!

</details>

## Summary

Workflow optimization is about working smarter, not harder:

- **Caching** is the easiest and biggest win (add `cache: 'npm'`)
- **Concurrency control** prevents wasted compute on outdated runs
- **Path filters** skip unnecessary workflows entirely
- **Timeouts** catch problems quickly and save resources
- **Parallel jobs** utilize multiple runners efficiently
- **Conditional steps** run expensive operations only when needed

Fast workflows mean:

- Developers stay focused and productive
- Faster iteration and shorter feedback loops
- Lower costs and better resource utilization
- Happier development teams

Target: Keep workflows under 3 minutes for the best developer experience!

## Additional Resources

- [GitHub Actions Caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Workflow Concurrency](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#concurrency)
- [Path Filters](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)
