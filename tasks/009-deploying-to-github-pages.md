# Lesson 9: Deploying to GitHub Pages

## The Story: From Build to World

Elena has been working through the GitHub Actions workshop. She's built the project, run tests, and created artifacts.
But her project is still just sitting in her repository. "How do I actually share this with the world?" she wonders.

She wants to deploy the workshop website to a real URL where anyone can access it. She's heard of GitHub Pages - a free
hosting service for static websites. Perfect!

But when she tries to manually upload files to GitHub Pages, she realizes there's a better way. "If GitHub Actions can
build my site automatically, why can't it deploy it too?"

She's about to discover the power of automated deployments!

## What is GitHub Pages?

GitHub Pages is a free static site hosting service that lets you publish websites directly from a GitHub repository.
It's perfect for:

- Documentation sites
- Project portfolios
- Blogs and personal websites
- Demo applications
- Workshop materials (like this one!)

Your site will be available at: `https://<username>.github.io/<repository-name>`

> [!NOTE]
> GitHub Pages only hosts **static** sites (HTML, CSS, JavaScript). It doesn't run server-side code like
> Node.js, Python, or databases.

## Introduction to Workflow Permissions

Before we deploy, we need to understand **permissions**. This is the first time we're encountering them, so let's break
it down.

### What Are Permissions?

Permissions control what actions a workflow can perform in your repository and with GitHub services. By default,
workflows have limited access for security reasons.

Think of permissions like keys to different rooms:

- 🔑 `contents: read` - Can read repository files
- 🔑 `contents: write` - Can modify repository files
- 🔑 `pages: write` - Can deploy to GitHub Pages
- 🔑 `id-token: write` - Can verify deployment authenticity

### Why Do We Need Permissions?

Imagine if any workflow could do anything without restrictions:

- Malicious workflows could delete your entire repository
- Compromised actions could steal secrets or modify code
- Unauthorized deployments could happen

Permissions follow the **principle of least privilege**: only grant the minimum permissions needed for the job.

### Setting Permissions in Workflows

Permissions can be set at two levels:

**1. Workflow Level** (applies to all jobs):

```yaml
name: Deploy

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  # All jobs inherit these permissions
```

**2. Job Level** (applies to specific job):

```yaml
jobs:
  deploy:
    permissions:
      contents: read
      pages: write
    steps:
      # Only this job has these permissions
```

> [!TIP]
> Always set permissions at the most specific level needed. Job-level permissions are more secure than
> workflow-level permissions.

## Configuring GitHub Pages

Before creating a deployment workflow, you need to configure GitHub Pages in your repository.

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** in the left sidebar
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - (The old method used "Deploy from a branch", but GitHub Actions is now the recommended approach)

That's it! Your repository is now ready to accept deployments from GitHub Actions.

> [!NOTE]
> You might see a message about branch protection. This is normal - GitHub Actions deployments work differently
> than branch deployments.

### Step 2: Understanding the Deployment Process

When deploying to GitHub Pages with GitHub Actions:

1. **Build**: Your workflow builds the static site
2. **Upload**: The build output is uploaded as a special "pages" artifact
3. **Deploy**: GitHub Pages takes the artifact and publishes it

This is different from regular artifacts - GitHub Pages artifacts have special handling.

## The Deployment Workflow

Let's create a workflow that deploys this workshop to GitHub Pages!

### Required Actions

GitHub provides three official actions for Pages deployment:

1. **`actions/configure-pages@v5`** - Sets up GitHub Pages configuration
2. **`actions/upload-pages-artifact@v3`** - Uploads your build as a Pages artifact
3. **`actions/deploy-pages@v4`** - Deploys the artifact to GitHub Pages

### Required Permissions

For GitHub Pages deployment, you need:

```yaml
permissions:
  contents: read # To read repository files
  pages: write # To deploy to GitHub Pages
  id-token: write # To verify the deployment source
```

**Why `id-token: write`?**

This permission allows GitHub to verify that the deployment request genuinely came from your workflow. It's a security
measure that prevents unauthorized deployments.

## Basic Deployment Workflow

Here's a simple workflow to deploy to GitHub Pages:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

# Required permissions for GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one deployment at a time
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm install

      - name: Build site
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

**Key points**:

- Triggers on pushes to `main` branch
- Sets required permissions at workflow level
- Uses `concurrency` to prevent multiple simultaneous deployments
- Builds the site into `dist/` directory
- Uploads `dist/` as a Pages artifact
- Deploys the artifact

## Better Pattern: Separate Build and Deploy

For better organization and reusability, separate building and deploying into different jobs:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm install

      - name: Build site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

  deploy:
    needs: build
    runs-on: ubuntu-latest

    # Deployment specific settings
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Improvements**:

- Build and deploy are separate jobs
- Only build job has `contents: read` permission (implicitly)
- Deploy job uses `environment` for tracking
- Deploy step outputs the URL where site is published

## Understanding Environments

The `environment` keyword creates a deployment environment:

```yaml
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

**Benefits**:

- Track deployment history in GitHub UI
- See deployed URLs in pull requests
- Enable environment protection rules (for advanced use)
- View deployment status in the "Environments" tab

## Deployment on Pull Requests

You might want to preview changes before deploying to production. Here's a workflow that builds on PRs but only deploys
on main:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm install
      - run: npm run build

      # Only upload artifact on main branch
      - name: Upload artifact
        if: github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

  deploy:
    # Only run deploy job on main branch
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - uses: actions/configure-pages@v5
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**How it works**:

- PRs trigger the workflow and build the site (verifying it builds successfully)
- Only pushes to `main` upload the artifact and deploy
- Uses `if: github.ref == 'refs/heads/main'` to conditionally run steps

## Task: Deploy This Workshop to GitHub Pages

Your task is to create a deployment workflow for this workshop!

**Requirements:**

1. Create a new workflow file `.github/workflows/deploy.yml`
2. The workflow should:

   - Trigger on pushes to the `main` branch
   - Build the site using `npm run build`
   - Deploy the `dist/` directory to GitHub Pages
   - Use separate jobs for building and deploying
   - Set appropriate permissions
   - Use the `github-pages` environment for the deploy job

3. Before running the workflow:

   - Configure GitHub Pages in repository settings (Settings → Pages → Source: "GitHub Actions")

4. After the workflow runs:
   - Visit your deployed site at `https://<username>.github.io/<repository-name>`
   - Verify the workshop tasks are visible

**Bonus Challenge:**

- Add a step that prints the deployment URL after successful deployment
- Configure the workflow to also run on workflow_dispatch (manual trigger)
- Add a check that fails if the `dist/` directory is empty after build

<details>
  <summary>Possible solution</summary>

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch: # Allow manual triggering

permissions:
  contents: read
  pages: write
  id-token: write

# Prevent concurrent deployments
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm install

      - name: Build site
        run: npm run build

      - name: Verify build output
        run: |
          if [ ! "$(ls -A dist)" ]; then
            echo "Error: dist directory is empty!"
            exit 1
          fi
          echo "Build output verified: $(ls -la dist | wc -l) files"

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      - name: Output deployment URL
        run: |
          echo "🚀 Site deployed successfully!"
          echo "📍 URL: ${{ steps.deployment.outputs.page_url }}"
```

**What this workflow does:**

1. **Triggers**: On pushes to main or manually via workflow_dispatch
2. **Permissions**: Sets all three required permissions for Pages deployment
3. **Concurrency**: Prevents multiple deployments from running simultaneously
4. **Build job**:
   - Checks out code
   - Sets up Node.js with caching
   - Installs dependencies
   - Builds the site
   - Verifies dist/ is not empty
   - Uploads dist/ as a Pages artifact
5. **Deploy job**:
   - Waits for build to complete
   - Uses github-pages environment
   - Configures Pages
   - Deploys the artifact
   - Prints the deployment URL

**After deployment:**

- Visit the URL shown in the workflow logs
- Check the "Environments" tab to see deployment history
- Your workshop is now live! 🎉

</details>

## Common Issues and Troubleshooting

### Issue: "Permissions error" or "Resource not accessible by integration"

**Solution**: Make sure you've set all three required permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Issue: "No artifact found"

**Solution**: Verify that:

- The build step creates files in `dist/` (or your specified path)
- The path in `upload-pages-artifact` matches your build output
- The build job completed successfully before deploy

### Issue: "404 Not Found" when visiting the site

**Solution**:

- Make sure there's an `index.html` in the root of your `dist/` folder
- Check the deployment logs for errors
- Verify the repository name in the URL matches your actual repository

### Issue: Multiple deployments overwriting each other

**Solution**: Use concurrency control:

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

## Summary

Deploying to GitHub Pages with Actions is straightforward:

- **Configure Pages**: Set source to "GitHub Actions" in repository settings
- **Set Permissions**: `contents: read`, `pages: write`, `id-token: write`
- **Three Actions**: configure-pages, upload-pages-artifact, deploy-pages
- **Environment**: Use `github-pages` environment for tracking
- **Concurrency**: Prevent simultaneous deployments

Benefits of automated deployment:

- ✅ Every push to main automatically deploys
- ✅ No manual upload steps
- ✅ Consistent deployment process
- ✅ Deployment history and tracking
- ✅ Free hosting for public repositories

Your workshop is now live and automatically updates with every change! 🎉

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Deploying with GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
- [actions/deploy-pages](https://github.com/actions/deploy-pages)
- [Workflow Permissions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions)

[Next Lesson: Lesson 10 - Matrices](010-matrices.md)

<!--
Add:
You might ask yourself, how do we deploy without a token? Is there no security here?? Each workflow will be issued a short-lived token. This token can be used to authenticate API requests and is scoped to the permissions defined in the workflow. This means that even if someone were to intercept this token, they would only be able to perform actions that the workflow is permitted to do, and only for a limited time.

The token can be accessed in your workflow using the `${{ secrets.GITHUB_TOKEN }}` variable. This token is automatically generated by GitHub for each workflow run, so you don't need to create or manage it manually.

The token only has read permissions to the repository by default. If your workflow needs to perform write operations, such as pushing code or creating releases, you must explicitly set the required permissions in your workflow file.
-->
