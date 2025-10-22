# Lesson 2: Other Events

The previous lesson showed you how to use the `push` event to run a workflow whenever code is pushed to the repository.
However, GitHub Actions supports many other events that can trigger workflows.

Examples are `pull_request`, `issues`, `release`, and many more. You can see the full list in GitHub's
[events documentation](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows).

Let's make a workflow that runs whenever a pull request is opened!

## Task: Create a Workflow Triggered by Pull Requests

1. Create a new file in the `.github/workflows/` directory called `pull-request.yml` (the name can be anything you like)
2. Set a `name` for the workflow, e.g., "Pull Request Workflow"
3. Set the workflow to trigger on the `pull_request` event (`on: pull_request`)
4. As before, create a job called `say-hello` that runs on `ubuntu-latest`
5. Add a step that prints "Hello, Pull Request!" to the terminal
6. Save your file

Now it's crucial that we create a new Git branch for this change, since we want to open a pull request to trigger the
workflow. If we commit directly to the `main` branch, there won't be a pull request to trigger the workflow, and as
such, it won't run.

1. Create a new branch:

   ```bash
   git checkout -b pull-request-workflow
   ```

2. Commit and push your changes:

   ```bash
   git add .github/workflows/pull-request.yml
   git commit -m "Add pull request workflow"
   git push -u origin pull-request-workflow
   ```

3. Open a pull request from your new branch to `main` on GitHub

In the "Actions" tab of your repository, you should see that the "Pull Request Workflow" has run. You can also see it in
the "Checks" tab of your pull request. The job should have succeeded, and won't block merge.

Congratulations! You've created a workflow that runs on pull requests 🎉

Let's move on to the next lesson where we'll create a workflow that builds our project and prevents merging if the build
fails.

[Lesson 3: Running a Build](./003-running-build.md)
