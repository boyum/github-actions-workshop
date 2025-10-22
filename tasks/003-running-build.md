# Lesson 3: Running a Build

## Problem Statement

In this lesson, you'll create your first GitHub Actions workflow that actually builds something! Within this project,
there is a `build.js` file that simulates a typical build process.

Running build steps like this is common in workflows in real projects.

Just a heads up before you run your workflow - I think there might be an error in the code 🧨 Let's create and run the
workflow to see what the output looks like before we start debugging.

## Step-by-Step Instructions

Let's make a simple workflow that runs `npm run build` to build our project.

> [!TIP]
> In this task, as well as in some of the following tasks, you will see a `uses: actions/checkout@v5` action.
> What this does is simply to checkout a repository (by default it will checkout the repo we are working in). The
> runners (we will get back to the various types of runners later!) will have various tools pre-installed, like `Git`,
> `Bash`, `Python` etc., but it will not know the context of the repo we are working in 🤖

It's worth noting that you can find all sorts of pre-made actions in the
[GitHub Marketplace](https://github.com/marketplace?type=actions).

> [!INFO]
> In these lessons, we will be running Node commands like `npm install` and `npm run build`. If you're not
> familiar with Node.js and npm, don't worry! The focus here is on learning GitHub Actions. You can think of these
> commands as placeholders for whatever build commands are relevant to your own projects.

## 3.1 Creating a workflow that tries to build the project

1. In a **new** workflow file (e.g. `.github/workflows/build.yml`), create a workflow that runs on `pull_request`
   events.

   ```yaml
   name: Build on PR
   on:
     # This workflow will only run for pull requests targeting the main branch
     pull_request:
       branches:
         - main

   jobs:
     build:
       name: Build Project
       runs-on: ubuntu-latest
       steps:
         # Remember we have to check out the repository first!
         - name: Checkout repository
           uses: actions/checkout@v5

         # This step installs the dependencies
         - name: Install dependencies
           run: npm ci
   ```

2. Add a **step** that runs the build command:

   ```yaml
   - name: Build
     run: npm run build
   ```

3. Commit and push your changes to a new branch, then open a pull request to `main` to trigger the workflow. You can do
   this by navigating to the "Pull requests" tab in your repository and clicking the "New pull request" button.

4. Observe the workflow run in the "Actions" tab of your repository or in the "Checks" tab of your pull request.

5. You should see that the build step fails due to an error in the code. However, you might also notice that you are
   still able to merge the pull request despite the failed build. That can't be good? 😅 We'll fix that in the next
   task! Let's move on to [Lesson 4: Branch Rulesets](./004-branch-rulesets.md) to set up branch protection rules that
   will prevent merging if the build fails.
