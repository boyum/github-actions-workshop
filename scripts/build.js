


🧨 I'm a bug!!! Please remove me!!! 🧨



import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import markedAlert from "marked-alert";
import { gfmHeadingId } from "marked-gfm-heading-id";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

const srcDir = path.join(projectRoot, "public");
const distDir = path.join(projectRoot, "dist");
const tasksDir = path.join(projectRoot, "tasks");

// Configure marked with GitHub Flavored Markdown extensions
marked.use(gfmHeadingId());
marked.use(markedAlert());

/**
 * Recursively copy files from source to destination
 */
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach((file) => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

/**
 * Clean the dist directory
 */
function clean() {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });
}

/**
 * Generate HTML template for markdown content
 */
function generateMarkdownHTML(title, content) {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} - GitHub Actions Workshop</title>
        <link rel="stylesheet" href="../css/styles.css" />
        <link rel="stylesheet" href="../css/github-markdown.css" />
        <style>
          .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          @media (max-width: 767px) {
            .markdown-body {
              padding: 15px;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>GitHub Actions Workshop</h1>
          <nav>
            <ul>
              <li><a href="../index.html">Home</a></li>
              <li><a href="../about.html">About</a></li>
              <li><a href="../tasks.html">Tasks</a></li>
              <li><a href="../demo.html">Demo</a></li>
              <li><a href="../snake.html">Snake</a></li>
            </ul>
          </nav>
        </header>

        <main>
          <article class="markdown-body">${content}</article>
        </main>

        <footer>
          <p>&copy; 2025 GitHub Actions Workshop</p>
        </footer>

        <script src="../js/main.js"></script>
      </body>
    </html>`;
}

/**
 * Process markdown files from tasks directory
 */
async function processMarkdownFiles() {
  console.log("Processing markdown files from tasks directory...");

  if (!fs.existsSync(tasksDir)) {
    console.warn(
      "Warning: tasks directory not found, skipping markdown processing"
    );
    return [];
  }

  // Sleep 10 seconds to simulate slow builds
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  
  const files = fs
    .readdirSync(tasksDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  const tasksOutputDir = path.join(distDir, "tasks");
  if (!fs.existsSync(tasksOutputDir)) {
    fs.mkdirSync(tasksOutputDir, { recursive: true });
  }

  const tasksList = [];

  files.forEach((file) => {
    const filePath = path.join(tasksDir, file);
    const markdown = fs.readFileSync(filePath, "utf-8");

    // Parse markdown to HTML
    const html = marked.parse(markdown);

    // Extract title from first heading or filename
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : file.replace(".md", "");

    // Generate output filename
    const outputFilename = file.replace(".md", ".html");
    const outputPath = path.join(tasksOutputDir, outputFilename);

    // Generate full HTML page
    const fullHTML = generateMarkdownHTML(title, html, outputFilename);

    // Write the HTML file
    fs.writeFileSync(outputPath, fullHTML);

    console.log(`  ✓ Generated ${outputFilename}`);

    tasksList.push({
      filename: outputFilename,
      title: title,
      originalFile: file,
    });
  });

  return tasksList;
}

/**
 * Generate tasks index page
 */
function generateTasksIndex(tasksList) {
  console.log("Generating tasks index page...");

  const tasksListHTML = tasksList
    .map((task) => {
      const taskNumber = task.originalFile.match(/^(\d+)/)?.[1];
      const displayTitle = taskNumber
        ? `Task ${parseInt(taskNumber)}: ${task.title}`
        : task.title;

      return `
      <li class="task-item">
        <a href="tasks/${task.filename}">
          <h3>${displayTitle}</h3>
        </a>
      </li>`;
    })
    .join("");

  const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tasks - GitHub Actions Workshop</title>
    <link rel="stylesheet" href="css/styles.css">
    <style>
        .task-list {
            list-style: none;
            padding: 0;
        }
        .task-item {
            background: #f6f8fa;
            margin-bottom: 1rem;
            border-radius: 6px;
            border-left: 4px solid #667eea;
            transition: transform 0.2s;
        }
        .task-item:hover {
            transform: translateX(5px);
        }
        .task-item a {
            display: block;
            padding: 1.5rem;
            text-decoration: none;
            color: inherit;
        }
        .task-item h3 {
            color: #667eea;
            margin: 0;
        }
    </style>
</head>
<body>
    <header>
        <h1>GitHub Actions Workshop</h1>
        <nav>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="tasks.html">Tasks</a></li>
                <li><a href="demo.html">Demo</a></li>
                <li><a href="snake.html">Snake</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section>
            <h2>Workshop Tasks</h2>
            <p>Follow these tasks in order to learn GitHub Actions step by step.</p>
            <ul class="task-list">
                ${tasksListHTML}
            </ul>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 GitHub Actions Workshop</p>
    </footer>

    <script src="js/main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, "tasks.html"), indexHTML);
  console.log("  ✓ Generated tasks.html");
}

/**
 * Copy GitHub markdown CSS
 */
function copyGitHubMarkdownCSS() {
  console.log("Copying GitHub markdown CSS...");

  const cssSourcePath = path.join(
    projectRoot,
    "node_modules",
    "github-markdown-css",
    "github-markdown-light.css"
  );
  const cssDestPath = path.join(distDir, "css", "github-markdown.css");

  if (fs.existsSync(cssSourcePath)) {
    fs.copyFileSync(cssSourcePath, cssDestPath);
    console.log("  ✓ Copied github-markdown.css");
  } else {
    console.warn("Warning: GitHub markdown CSS not found");
  }
}

/**
 * Build the project
 */
function build() {
  console.log("Building project...");

  // Clean dist directory
  console.log("Cleaning dist directory...");
  clean();

  // Check if public directory exists
  if (!fs.existsSync(srcDir)) {
    console.error("Error: public directory not found!");
    process.exit(1);
  }

  // Copy files from public to dist
  console.log("Copying files from public to dist...");
  copyRecursive(srcDir, distDir);

  // Copy GitHub markdown CSS
  copyGitHubMarkdownCSS();

  // Process markdown files from tasks directory
  const tasksList = processMarkdownFiles();

  // Generate tasks index page
  if (tasksList.length > 0) {
    generateTasksIndex(tasksList);
  }

  console.log("Build completed successfully!");
  console.log(`Output directory: ${distDir}`);
  console.log(`Generated ${tasksList.length} task pages`);
}

// Run the build
build();
