# Lesson 5: Steps vs Jobs

By now, we've seen a few workflows with jobs and steps.
But what exactly is the difference between a job and a step?

In short, a **job** is a collection of **steps** that run on the same runner.
A **step** is an individual task that can run commands or actions.

Jobs run in parallel by default, while steps within a job run sequentially.

The world **parallel** often is a cue for speeding things up.
By splitting tasks into multiple jobs, we can run them simultaneously on different runners.
Use cases for this include running linting, testing, building and formatting checks in parallel.
However, keep in mind that jobs running in parallel can lead to increased resource usage and longer setup times.

Each job runs in its own virtual environment, so they do not share state unless you explicitly pass data between them using artifacts or other means.
Steps within a job, on the other hand, run one after the other on the same runner.
This means that steps can share data through the file system or environment variables.

Here's a quick example to illustrate the difference:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test
```

In this example, we have two jobs: `build` and `test`.
Each job has its own set of steps.
The `build` job checks out the code, installs dependencies, and builds the project.
The `test` job checks out the code and runs tests.

> [!NOTE]
> In the example above, we check out the code and install dependencies in both jobs.
> Unless we explicitly cache dependencies or share artifacts between jobs, this leads
> to duplicated work and longer overall execution time.

Save the planet 🌍 - avoid duplicating work across jobs when possible!
This also saves you money if you're on a paid plan with limited minutes (the default public tier gives us 2000 free minutes per month).

In summary, use jobs to group related steps that can run in parallel, and use steps to define individual tasks within those jobs.

## Task: Create a Workflow that builds and tests in parallel

Using the workflow from [Task 2: Running a Build](./002-running-build.md) as a starting point, create a new workflow that has two jobs: one for building the project and another for running tests.

Hint: `npm run build` builds the project, and `npm test` runs the tests.

[Next Lesson: Lesson 6 - Job Outputs](006-outputs.md)
