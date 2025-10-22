# Lesson 2: Understanding Workflow Anatomy

**Estimated Time**: 30 minutes **Difficulty**: Beginner

## Problem Statement

In Lesson 1, you created a simple workflow that prints messages when you push code. But that workflow was a black
box—you copied and pasted YAML code without fully understanding what each piece does. If you want to customize workflows
for real projects, you need to understand the building blocks.

Imagine you're trying to fix a car without knowing what the engine, transmission, or brakes do. You might get lucky
once, but you'll eventually get stuck. The same applies to GitHub Actions: understanding workflow anatomy is essential
for diagnosing issues, optimizing performance, and building complex automation pipelines.

In this lesson, you'll dissect a workflow file piece by piece, learning what each component does and how they work
together. By the end, you'll be able to read any workflow and understand exactly what it does.

## Concepts Introduction

### Workflow Structure Hierarchy

Every GitHub Actions workflow follows this hierarchy:

```text
Workflow (entire file)
└── Events (triggers)
└── Jobs (one or more)
    └── Runner (virtual machine)
    └── Steps (one or more)
        └── Actions or Commands
```

Think of it like a company organization chart:

- **Workflow**: The entire company
- **Events**: What causes the company to start working (a customer order)
- **Jobs**: Different departments (shipping, billing, customer service)
- **Runner**: The office space where a department works
- **Steps**: Individual tasks employees do (pack box, print label, etc.)

### Core Components

**Workflow**: The entire automation process, defined in a single YAML file. You can have multiple workflow files in
`.github/workflows/`.

**Events**: Triggers that start a workflow run. Examples: `push`, `pull_request`, `schedule`, `workflow_dispatch`.

**Jobs**: A set of steps that execute on the same runner. Jobs run in parallel by default, but you can configure them to
run sequentially.

**Runners**: Virtual machines provided by GitHub (or self-hosted) that execute your jobs. GitHub offers Ubuntu Linux
(`ubuntu-latest`), Windows (`windows-latest`), and macOS (`macos-latest`) runners. See
<https://github.com/actions/runner-images> for all hosted runners.

**Steps**: Individual tasks within a job. Each step can either run commands (`run:`) or use pre-built actions (`uses:`).

**Actions**: Reusable units of code that perform specific tasks. You can use actions created by GitHub, the community,
or write your own.

## Step-by-Step Instructions

Let's create a more comprehensive workflow that demonstrates each component clearly.

### Step 1: Create a New Workflow

Create a new file `.github/workflows/anatomy-demo.yml` with the following content:

```yaml
# This is a comment - it's ignored by GitHub Actions

name: Workflow Anatomy Demo

# Events - Define when this workflow runs
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:

# Jobs - Define what work to do
jobs:
  # First job: information gathering
  gather-info:
    name: Gather System Information
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Display runner information
        run: |
          echo "Workflow: ${{ github.workflow }}"
          echo "Repository: ${{ github.repository }}"
          echo "Event: ${{ github.event_name }}"
          echo "Branch: ${{ github.ref }}"
          echo "Runner OS: ${{ runner.os }}"
          echo "Runner Architecture: ${{ runner.arch }}"

      - name: List files in repository
        run: ls -la

      - name: Show current directory
        run: pwd

  # Second job: demonstrate different runner
  test-on-windows:
    name: Test on Windows
    runs-on: windows-latest

    steps:
      - name: Print Windows info
        run: |
          echo "Running on Windows!"
          systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
```

### Step 2: Understand the Events Section

Let's break down the `on:` section:

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:
```

- **`push:`** - Triggers when code is pushed to the repository
  - `branches: [ main, develop ]` - Only trigger on pushes to these branches
- **`pull_request:`** - Triggers when a PR is opened or updated
  - `branches: [ main ]` - Only for PRs targeting the main branch
- **`workflow_dispatch:`** - Allows manual triggering from the GitHub UI (you'll see a "Run workflow" button)

**Why filter by branches?** Imagine you have 20 feature branches. Without filtering, every push to any branch would
trigger the workflow, wasting resources.

### Step 3: Understand the Jobs Section

Each job runs independently on its own runner:

```yaml
jobs:
  gather-info:
    name: Gather System Information
    runs-on: ubuntu-latest
```

- **`gather-info:`** - The job ID (must be unique within the workflow)
- **`name:`** - Human-readable name shown in the GitHub UI
- **`runs-on:`** - Specifies the runner type:
  - `ubuntu-latest` - Latest Ubuntu Linux
  - `windows-latest` - Latest Windows Server
  - `macos-latest` - Latest macOS

**Important**: Each job starts fresh with a clean virtual machine. Files created in one job don't exist in another
unless you explicitly share them (you'll learn this in later lessons).

### Step 4: Understand the Steps Section

Steps run sequentially within a job. There are two types:

**Type 1: Using Actions**

```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

- **`uses:`** - Runs a pre-built action (reusable code)
- **`actions/checkout@v4`** - Official GitHub action that clones your repository
- The `@v4` specifies the version

**Type 2: Running Commands**

```yaml
- name: Display runner information
  run: |
    echo "Workflow: ${{ github.workflow }}"
    echo "Repository: ${{ github.repository }}"
```

- **`run:`** - Executes shell commands
- **`|`** - Allows multiple lines
- **`${{ }}`** - Context expressions that access workflow data

### Step 5: Understand Context Expressions

Context expressions `${{ }}` give you access to information about the workflow run:

- **`github.workflow`** - The workflow name
- **`github.repository`** - Repository name (format: `owner/repo`)
- **`github.event_name`** - What triggered the workflow (`push`, `pull_request`, etc.)
- **`github.ref`** - Git reference (like `refs/heads/main`)
- **`runner.os`** - Operating system of the runner
- **`runner.arch`** - Architecture of the runner (x64, ARM, etc.)

These are like variables in programming—they hold information you can use in your workflow.

### Step 6: Commit and Push

```bash
git add .github/workflows/anatomy-demo.yml
git commit -m "Add workflow anatomy demo"
git push origin main
```

### Step 7: Observe the Workflow Run

1. Go to the Actions tab on GitHub
2. Click on "Workflow Anatomy Demo"
3. Click on the latest run

**Key observations**:

- You'll see two jobs: "Gather System Information" and "Test on Windows"
- They run in parallel (simultaneously)
- Each job has its own logs
- The Windows job uses different commands (`systeminfo` vs `ls`)

### Step 8: Manually Trigger the Workflow

Because we included `workflow_dispatch:`, you can manually trigger this workflow:

1. In the Actions tab, click "Workflow Anatomy Demo" in the left sidebar
2. Click the "Run workflow" button (top right)
3. Select the branch (main)
4. Click "Run workflow"

This is incredibly useful for workflows that deploy to production—you want manual control, not automatic triggers.

### Step 9: Examine the Output

Click into each job and expand the steps. Notice:

- **In "Gather System Information"**:
  - The checkout step clones your repository
  - The runner information shows Linux
  - You see your repository files listed

- **In "Test on Windows"**:
  - Different commands work (`systeminfo` vs `uname`)
  - The runner is a Windows machine
  - Steps run independently from the first job

## Common Pitfalls and Troubleshooting

### Jobs Run in Parallel

By default, all jobs run simultaneously. If you need jobs to run in order, you'll learn about `needs:` in Lesson 10. For
now, remember: jobs are independent.

### Missing Checkout Step

If you try to access your repository files without the `actions/checkout` action, you'll get errors. The runner starts
with an empty directory—checkout clones your code into it.

```yaml
# Wrong - no checkout, can't access files
steps:
  - name: Run tests
    run: npm test # Error: package.json not found
```

```yaml
# Correct - checkout first
steps:
  - uses: actions/checkout@v4
  - name: Run tests
    run: npm test # Works!
```

### Context Expression Syntax

Always use `${{ }}` syntax:

```yaml
# Wrong
run: echo "Branch: github.ref"

# Correct
run: echo "Branch: ${{ github.ref }}"
```

### YAML Multi-line Syntax

For multiple commands, use `|`:

```yaml
# Wrong - syntax error
run: echo "Line 1"
     echo "Line 2"

# Correct
run: |
  echo "Line 1"
  echo "Line 2"
```

### Job IDs vs Job Names

Job IDs (like `gather-info`) are used internally and in YAML references. Job names (like `Gather System Information`)
are displayed in the UI. Both should be descriptive.

## Exercise

Now it's your turn! Modify the `anatomy-demo.yml` workflow to add a third job that:

1. Runs on `macos-latest`
2. Has at least 2 steps
3. Uses the checkout action
4. Prints some macOS-specific information (hint: try `sw_vers` command)

**Success criteria**: After pushing, you should see three jobs running in parallel in the Actions tab.

<details>
 <summary>Click to see solution</summary>

```yaml
test-on-macos:
  name: Test on macOS
  runs-on: macos-latest

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Print macOS info
      run: |
        echo "Running on macOS!"
        sw_vers
        sysctl -n machdep.cpu.brand_string
```

</details>

## Key Takeaways

- Workflows are defined in YAML files in `.github/workflows/`
- Events (`on:`) determine when workflows run; you can filter by branches or other criteria
- Jobs run in parallel by default on separate runners
- Steps within a job run sequentially and can execute commands (`run:`) or actions (`uses:`)
- Context expressions `${{ }}` provide access to workflow metadata and GitHub information
- The `actions/checkout` action is nearly always your first step—it clones your code

---

**Previous Lesson**: [Getting Started with GitHub Actions](001-getting-started.md)

**Next Lesson**: [Events and Triggers](003-events-and-triggers.md) - Master all the ways to trigger workflows.

**Additional Resources**:

- [Workflow Syntax Documentation](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Context Expressions Reference](https://docs.github.com/en/actions/learn-github-actions/contexts)
- [Available Runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners)
