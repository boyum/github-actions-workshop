# Lesson 7: Artifacts

## The Story: The Rebuild Nightmare

Sarah is working on a deployment workflow. She has three jobs:

1. Build the application
2. Test the built application
3. Deploy the built application

Her first attempt looks like this:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm install
      - run: npm run build

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm install
      - run: npm run build # Build again?!
      - run: npm test

  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm install
      - run: npm run build # Build AGAIN?!?!
      - run: ./deploy.sh
```

Sarah watches in horror as her workflow runs. The build takes 5 minutes. The workflow rebuilds the project THREE TIMES, wasting 15 minutes total and tripling her GitHub Actions usage!

"There must be a way to share the built files between jobs!" she realizes.

**Enter artifacts!** 📦

## What Are Artifacts?

> [!TIP]
> An artifact is a file or set of files that are produced by a workflow and can be used by other jobs or downloaded later.

Artifacts allow you to:

- **Share files between jobs** - Build once, use in multiple jobs
- **Persist files after a workflow completes** - Download logs, test results, or build outputs
- **Avoid rebuilding** - Save time and money by building once
- **Store test results** - Keep screenshots, coverage reports, or logs for debugging

Common use cases include:

- Sharing build outputs (`dist/`, `build/`, compiled binaries)
- Passing test coverage reports between jobs
- Storing logs or screenshots from failed tests
- Creating downloadable releases or debug bundles

> [!NOTE]
> Each job runs in a fresh virtual environment. Without artifacts, files created in one job don't exist in other jobs!

## Uploading Artifacts

Use the `actions/upload-artifact` action to save files:

```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7 # Optional: how long to keep (default: 90 days)
```

### Upload Options

You can customize artifact uploads:

```yaml
- name: Upload multiple paths
  uses: actions/upload-artifact@v4
  with:
    name: app-bundle
    path: |
      dist/
      config/
      README.md
    retention-days: 30
```

Or upload multiple separate artifacts:

```yaml
- name: Upload logs
  uses: actions/upload-artifact@v4
  with:
    name: build-logs
    path: logs/*.log

- name: Upload coverage
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/
```

## Downloading Artifacts

Use the `actions/download-artifact` action to retrieve files in another job:

```yaml
- name: Download build artifacts
  uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/ # Optional: where to extract
```

If you don't specify a path, artifacts are extracted to the current directory.

### Downloading All Artifacts

Download all artifacts from the current workflow run:

```yaml
- name: Download all artifacts
  uses: actions/download-artifact@v4
```

This creates a folder for each artifact.

## Artifact Retention

Artifacts are automatically deleted after their retention period:

- **Default retention**: 90 days
- **Configurable**: Set `retention-days` when uploading (1-90 days)
- **Storage limits**: Public repos have storage limits on paid plans

> [!TIP]
> Use shorter retention periods for temporary files like test logs. Use longer periods for releases or important build artifacts.

## Sarah's Improved Workflow

With artifacts, Sarah's workflow becomes much more efficient:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm install
      - run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
          retention-days: 5

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm install

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/

      - run: npm test

      # Upload test coverage as an artifact
      - name: Upload coverage report
        if: always() # Upload even if tests fail
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 30

  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/

      - name: Deploy
        run: ./deploy.sh
```

Now the project is built only once, saving 10 minutes and reducing costs by 66%!

## Combining Artifacts and Outputs

Artifacts and outputs work great together:

- **Artifacts**: For files (build outputs, reports, logs)
- **Outputs**: For metadata (version numbers, file counts, status flags)

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.number }}
      file-count: ${{ steps.count.outputs.total }}
    steps:
      - uses: actions/checkout@v5
      - run: npm install
      - run: npm run build

      - name: Get version
        id: version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "number=$VERSION" >> $GITHUB_OUTPUT

      - name: Count files
        id: count
        run: |
          COUNT=$(find dist -type f | wc -l)
          echo "total=$COUNT" >> $GITHUB_OUTPUT

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-v${{ steps.version.outputs.number }}
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-v${{ needs.build.outputs.version }}
          path: dist/

      - name: Deploy
        run: |
          echo "Deploying version ${{ needs.build.outputs.version }}"
          echo "Total files: ${{ needs.build.outputs.file-count }}"
          ./deploy.sh
```

## Task: Create a Workflow with Artifacts

Your task is to create a workflow that builds the project and shares the build output between jobs.

**Requirements:**

1. Create a new workflow file `.github/workflows/artifacts-demo.yml`
2. The workflow should trigger on `pull_request` events

3. Create three jobs:

   **Job 1: Build**
   - Checkout the code
   - Install dependencies with `npm install`
   - Run the build with `npm run build`
   - Upload the `dist/` directory as an artifact named `build-files`
   - Set artifact retention to 5 days

   **Job 2: Test**
   - Depend on the `build` job
   - Checkout the code (needed for package.json and test files)
   - Install dependencies
   - Download the `build-files` artifact
   - Run tests with `npm test`
   - Upload the coverage report from `coverage/` as an artifact named `coverage-report`
   - Use `if: always()` so coverage is uploaded even if tests fail
   - Set coverage retention to 30 days

   **Job 3: Report**
   - Depend on both `build` and `test` jobs
   - Download the `build-files` artifact
   - Download the `coverage-report` artifact
   - List the contents of both artifacts using `ls -la`
   - Print "Build and test artifacts successfully collected"

**Bonus Challenge:**

- Add a fourth job called `size-check` that:
  - Downloads the build artifacts
  - Calculates the total size of the `dist/` directory
  - Prints a warning if the total size is over 1MB

<details>
  <summary>Possible solution</summary>

```yaml
name: Artifacts Demo

on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Check out the code
        uses: actions/checkout@v5

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/
          retention-days: 5

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Check out the code
        uses: actions/checkout@v5

      - name: Install dependencies
        run: npm install

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist/

      - name: Run tests
        run: npm test

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 30

  report:
    needs: [build, test]
    runs-on: ubuntu-latest
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist/

      - name: Download coverage report
        uses: actions/download-artifact@v4
        with:
          name: coverage-report
          path: coverage/

      - name: List build artifacts
        run: |
          echo "Build artifacts:"
          ls -la dist/

      - name: List coverage artifacts
        run: |
          echo "Coverage artifacts:"
          ls -la coverage/

      - name: Success message
        run: echo "Build and test artifacts successfully collected"

  size-check:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist/

      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist/ | cut -f1)
          SIZE_MB=$((SIZE / 1024 / 1024))
          echo "Build size: ${SIZE_MB}MB"
          if [ $SIZE -gt 1048576 ]; then
            echo "⚠️  WARNING: Build size exceeds 1MB!"
          else
            echo "✅ Build size is acceptable"
          fi
```

This workflow demonstrates:

- **Artifact uploads**: Build outputs and coverage reports are saved
- **Artifact downloads**: Multiple jobs reuse the same build artifacts
- **Retention policies**: Different retention periods for different artifact types
- **Conditional uploads**: Coverage is uploaded even if tests fail using `if: always()`
- **Job dependencies**: Jobs wait for their dependencies using `needs`
- **Efficiency**: The project is built only once, saving time and resources!

</details>

## Summary

Artifacts are essential for efficient workflows:

- Upload files with `actions/upload-artifact@v4`
- Download files with `actions/download-artifact@v4`
- Share build outputs, test results, and logs between jobs
- Set appropriate retention periods to manage storage
- Combine with job outputs for maximum efficiency

In the next lesson, we'll explore how to create more complex job dependencies!

[Next Lesson: Lesson 8 - Job Dependencies](008-job-dependencies.md)
