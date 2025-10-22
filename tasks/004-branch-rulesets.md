# Lesson 4: Protecting your Branches with Rulesets

## Problem Statement

In this lesson, you'll learn how to protect your main branch using branch protection rules. By setting up these rules,
you can ensure that code changes are reviewed and tested before being merged. This helps maintain the integrity and
quality of your codebase, and is also a way to leverage GitHub to create a robust development environment.

In real life projects, branch protection rules are commonly used to enforce best practices and prevent accidental
changes to critical branches 💥

## Step-by-Step Instructions

1. You can find the branch protection rulesets under the "Settings" tab of your repository. You can use this link to go
   directly there, replacing `YOUR-USERNAME` with your GitHub username:
   - <https://github.com/YOUR-USERNAME/github-actions-workshop/settings/rules/new?target=branch>
2. You'll notice that there are several options available to configure branch protection rules. For this lesson, we'll focus
   on a few key settings:
   - **Enforcement status**: Set this to "Enabled" to enforce the rules on the selected branch.
   - **Target branches**: Here we select the branch we want to protect. In this case, `default` (which is usually
     `main`).
   - **Require a pull request before merging**: This ensures that all changes to the branch go through a pull request,
     allowing for code review and discussion (and workflows triggered on pull requests!)
   - **Require status checks to pass before merging**: This setting ensures that all required checks (like your build
     workflow) must pass before a pull request can be merged.
   - Here you will notice our previous, failed, `build` workflow. Select it as a required check.
3. Once you've configured the settings, click the "Create" button at the bottom of the page to save your branch
   protection ruleset.
4. Now, let's take a look at our previously created pull request that tried to build the project.
   - You should see that the pull request is now blocked from being merged because of the required status check! 🙅
5. To fix the build, we need to update the `scripts/build.js` file to resolve the error. Can you spot anything out of
   place in the top of the file? 🕵
6. Once you have fixed the error, commit the changes to your branch and push them to GitHub.
7. Now, go back to the pull request page. You should see that the build workflow has run again and passed successfully!
   ✅

Let's merge our pull request, and move on to the next task where we will explore steps vs. jobs:
[005-steps-vs-jobs.md](./005-steps-vs-jobs.md)
