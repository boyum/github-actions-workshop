# Lesson 1: Getting Started with GitHub Actions

## Problem Statement

In this lesson, you'll create your first GitHub Actions workflow that automatically runs every time you push code.
You'll see firsthand how automation can save time and catch issues immediately.

## Concepts Introduction

## Step-by-Step Instructions

Let's make a simple workflow that runs every time you push code and prints a welcome message.
This doesn't help us much in our day to day work, but bear with us.

### Step 1: Understand the Repository Structure

GitHub Actions workflows must be stored in a specific location in your repository:

```text
your-repository/
└── .github/
    └── workflows/
        └── your-workflow.yml
```

The `.github/workflows/` directory is where all your workflow files live. You can have multiple workflow files, and
GitHub will run each one according to its own triggers.

### Step 2: Create the Workflow Directory

> [!IMPORTANT]
> This directory does not exist by default. You'll need to create it. It _must_ be named exactly
> `workflows`, and _must_ live inside the `.github` directory in the **root** of the repository for GitHub to recognize
> it.

### Step 3: Create Your First Workflow File

Create a new file called `hello-world.yml` in the `.github/workflows/` directory.

### Step 4: Write the Workflow

Open `.github/workflows/hello-world.yml` and copy the following content:

```yaml
# Human-readable name for the workflow. These are optional, but recommended.
# Names make it much easier to identify workflows by name in the GitHub Actions UI.
name: Hello World Workflow 🌏

# Trigger the workflow "on" every push to any branch
# (keep in mind, the branch must be pushed to GitHub)
# Each workflow can have as many triggers as you like.
# Another common trigger is `pull_request`.
on:
  - push

jobs:
  say-hello:
    name: Say Hello

    # Which type of machine to run the job on (other options include `windows-latest` and `macos-latest`)
    runs-on: ubuntu-latest

    steps:
      # As with workflow and job names, step names are optional but recommended.
      # In case you need to debug your workflow later, having descriptive names is very helpful.
      - name: Print greeting
        run: echo "Hello, GitHub Actions! Welcome to the workshop!"

      - name: Print date and time
        run: date

      - name: Print system information
        run: |
          echo "Running on:"
          uname -a
```

### Step 5: Commit and Push

1. Save the file.
2. Commit your changes:

   ```bash
   git add .github/workflows/hello-world.yml
   git commit -m "Add hello world workflow"
   ```

3. Push to your repository:

   ```bash
   git push
   ```

### Step 6: Verify the Workflow Run

1. Go to the "Actions" tab in your GitHub repository.
2. You should see a new workflow run for "Hello World Workflow 🌏" triggered by
   your recent push.
3. Click on the workflow run to see the details.
4. Click on the job `say-hello` to see the steps executed.
5. Expand each step to see the output, including the greeting message, date and time, and system information.

Nice! You've successfully created and run your first GitHub Actions workflow!

### Summary

In this lesson, you learned how to create a simple GitHub Actions workflow that runs on every push to your repository.
You now understand the basic structure of a workflow file, including triggers, jobs, and steps.

This is just the beginning! In the next lessons, you'll explore more complex workflows that can automate testing,
building, and deploying your code.
Keep experimenting and happy coding!

Now proceed to [the next lesson](./002-running-build.md) to continue your journey!
