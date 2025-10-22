# Lesson 6: Job Outputs

## The Story: Passing the Baton

Alex is building a CI/CD pipeline. The build job generates important information:

- A version number for the release
- The git commit SHA
- Whether the build passed security checks

The deployment job needs all this information. Alex's first attempt is... creative:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Generate version
        run: echo "1.2.3" > version.txt

      - name: Save to artifact
        uses: actions/upload-artifact@v4
        with:
          name: version-file
          path: version.txt

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download version
        uses: actions/download-artifact@v4
        with:
          name: version-file

      - name: Read version
        run: cat version.txt
```

"This works," Alex thinks, "but I'm creating artifacts just to pass a single string? That seems excessive."

**Enter job outputs!** 🔢

## What Are Job Outputs?

Job outputs allow you to pass string data between jobs. They're perfect for:

- Version numbers, build IDs, or release tags
- Commit SHAs or branch names
- Status flags or boolean values
- Short strings or identifiers
- Even formatted text like test results or logs

> [!TIP]
> Use outputs for small pieces of data (strings, numbers, booleans). For large data or files, use artifacts instead (we'll cover those in the next lesson)!

## Setting Outputs

Outputs work in three steps:

1. **Set an output in a step** using `GITHUB_OUTPUT`
2. **Expose it at the job level** so other jobs can access it
3. **Reference it in other jobs** using `needs.{job-id}.outputs.{output-name}`

### Step 1: Setting an Output in a Step

Give your step an `id` and write to `$GITHUB_OUTPUT`:

```yaml
steps:
  - name: Generate version
    id: version # Important: give the step an ID
    run: |
      VERSION="1.2.3"
      echo "version=$VERSION" >> $GITHUB_OUTPUT
```

The format is `name=value`. Think of it like setting an environment variable that persists across jobs.

### Step 2: Expose the Output at Job Level

Reference the step output in the job's `outputs` section:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - name: Generate version
        id: version
        run: |
          VERSION="1.2.3"
          echo "version=$VERSION" >> $GITHUB_OUTPUT
```

Now the `version` output is available to other jobs!

### Step 3: Using Outputs in Other Jobs

Reference outputs from other jobs using `needs.{job-id}.outputs.{output-name}`:

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Deploy version
      run: echo "Deploying version ${{ needs.build.outputs.version }}"
```

> [!NOTE]
> The `needs` keyword serves two purposes: it creates a dependency (deploy waits for build) AND gives you access to the build job's outputs.

## Using Outputs Within the Same Job

You can also use outputs between steps in the same job:

```yaml
steps:
  - name: Generate version
    id: version
    run: echo "version=1.2.3" >> $GITHUB_OUTPUT

  - name: Use version in same job
    run: echo "Version is ${{ steps.version.outputs.version }}"
```

Notice the difference:

- **Same job**: `steps.{step-id}.outputs.{output-name}`
- **Different job**: `needs.{job-id}.outputs.{output-name}`

## Multiple Outputs

A job can have multiple outputs:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      commit-sha: ${{ steps.commit.outputs.sha }}
      build-status: ${{ steps.build.outputs.status }}
    steps:
      - name: Get version
        id: version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "version=$VERSION" >> $GITHUB_OUTPUT

      - name: Get commit SHA
        id: commit
        run: |
          SHA=$(git rev-parse --short HEAD)
          echo "sha=$SHA" >> $GITHUB_OUTPUT

      - name: Build and check status
        id: build
        run: |
          npm run build
          echo "status=success" >> $GITHUB_OUTPUT
```

## Multiline Outputs

What if you need to pass multiple lines, like test results or a formatted report? Use a heredoc with a delimiter:

```yaml
- name: Generate test report
  id: report
  run: |
    echo "report<<EOF" >> $GITHUB_OUTPUT
    echo "Test Results:" >> $GITHUB_OUTPUT
    echo "=============" >> $GITHUB_OUTPUT
    npm test >> $GITHUB_OUTPUT
    echo "EOF" >> $GITHUB_OUTPUT
```

Or capture command output that spans multiple lines:

```yaml
- name: Get git log
  id: gitlog
  run: |
    {
      echo "log<<EOF"
      git log --oneline -n 5
      echo "EOF"
    } >> $GITHUB_OUTPUT
```

Then use it in another job:

```yaml
- name: Display report
  run: |
    echo "Full test report:"
    echo "${{ needs.test.outputs.report }}"
```

> [!TIP]
> The delimiter (EOF in this case) can be any string. Just make sure it doesn't appear in your output! Common choices are EOF, DELIMITER, or END_OF_OUTPUT.

## Alex's Improved Workflow

With outputs, Alex's workflow becomes much cleaner:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      commit-sha: ${{ steps.commit.outputs.sha }}
      security-check: ${{ steps.security.outputs.passed }}
    steps:
      - uses: actions/checkout@v5

      - name: Generate version
        id: version
        run: |
          VERSION="1.2.3-${{ github.run_number }}"
          echo "version=$VERSION" >> $GITHUB_OUTPUT

      - name: Get commit SHA
        id: commit
        run: |
          SHA=$(git rev-parse --short HEAD)
          echo "sha=$SHA" >> $GITHUB_OUTPUT

      - name: Run security checks
        id: security
        run: |
          npm audit --audit-level=moderate
          echo "passed=true" >> $GITHUB_OUTPUT

      - run: npm run build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy if security passed
        if: needs.build.outputs.security-check == 'true'
        run: |
          echo "Deploying version ${{ needs.build.outputs.version }}"
          echo "From commit ${{ needs.build.outputs.commit-sha }}"
          echo "Security checks: PASSED"
```

No artifacts needed for simple data - just clean, efficient outputs!

## Task: Create a Workflow with Outputs

Your task is to create a workflow that generates build information and passes it between jobs.

**Requirements:**

1. Create a new workflow file `.github/workflows/outputs-demo.yml`
2. The workflow should trigger on `push` events

3. Create three jobs:

   **Job 1: Info**
   - Checkout the code
   - Get the current git commit SHA (short version: `git rev-parse --short HEAD`)
   - Get the current branch name (use: `git rev-parse --abbrev-ref HEAD`)
   - Get the commit message (use: `git log -1 --pretty=%B`)
   - Set all three values as job outputs

   **Job 2: Build**
   - Depend on the `info` job
   - Install dependencies with `npm install`
   - Run the build with `npm run build`
   - Print a message: "Building commit [SHA] on branch [BRANCH]"

   **Job 3: Summary**
   - Depend on both `info` and `build` jobs
   - Print a formatted summary showing:
     - The commit SHA
     - The branch name
     - The commit message

**Bonus Challenge:**

- In the `build` job, generate a multiline build report that includes:
  - A "Build Report" header
  - The Node.js version (use `node --version`)
  - The npm version (use `npm --version`)
  - A success message
- Set this multiline report as an output
- Display it in the summary job

<details>
  <summary>Possible solution</summary>

```yaml
name: Outputs Demo

on:
  push:

jobs:
  info:
    runs-on: ubuntu-latest
    outputs:
      commit-sha: ${{ steps.commit.outputs.sha }}
      branch-name: ${{ steps.branch.outputs.name }}
      commit-message: ${{ steps.message.outputs.text }}
    steps:
      - name: Check out the code
        uses: actions/checkout@v5

      - name: Get commit SHA
        id: commit
        run: |
          SHA=$(git rev-parse --short HEAD)
          echo "sha=$SHA" >> $GITHUB_OUTPUT

      - name: Get branch name
        id: branch
        run: |
          BRANCH=$(git rev-parse --abbrev-ref HEAD)
          echo "name=$BRANCH" >> $GITHUB_OUTPUT

      - name: Get commit message
        id: message
        run: |
          MESSAGE=$(git log -1 --pretty=%B)
          echo "text=$MESSAGE" >> $GITHUB_OUTPUT

  build:
    needs: info
    runs-on: ubuntu-latest
    outputs:
      build-report: ${{ steps.report.outputs.content }}
    steps:
      - name: Check out the code
        uses: actions/checkout@v5

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Print build info
        run: |
          echo "Building commit ${{ needs.info.outputs.commit-sha }} on branch ${{ needs.info.outputs.branch-name }}"

      - name: Generate build report
        id: report
        run: |
          {
            echo "content<<EOF"
            echo "Build Report"
            echo "============"
            echo "Node.js: $(node --version)"
            echo "npm: $(npm --version)"
            echo "Status: SUCCESS"
            echo "EOF"
          } >> $GITHUB_OUTPUT

  summary:
    needs: [info, build]
    runs-on: ubuntu-latest
    steps:
      - name: Display summary
        run: |
          echo "=== Workflow Summary ==="
          echo "Commit SHA: ${{ needs.info.outputs.commit-sha }}"
          echo "Branch: ${{ needs.info.outputs.branch-name }}"
          echo "Message: ${{ needs.info.outputs.commit-message }}"
          echo ""
          echo "${{ needs.build.outputs.build-report }}"
```

This workflow demonstrates:

- **Multiple outputs**: The info job exposes three different outputs
- **Cross-job access**: Both build and summary jobs use outputs from info
- **Multiline outputs**: The build report uses heredoc syntax to capture multiple lines
- **Job dependencies**: Jobs wait for their dependencies using `needs`

</details>

## Summary

Job outputs are a powerful way to pass data between jobs:

- Use `echo "name=value" >> $GITHUB_OUTPUT` to set outputs
- Expose outputs at the job level so other jobs can access them
- Reference outputs using `needs.{job-id}.outputs.{output-name}`
- Use heredoc syntax for multiline outputs
- Outputs are perfect for strings, numbers, and small pieces of data

In the next lesson, we'll learn about artifacts for sharing actual files between jobs!

[Next Lesson: Lesson 7 - Artifacts](007-artifacts.md)
