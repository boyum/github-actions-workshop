// Example test report with coverage:
// ✔ mathUtils > average > should calculate average of numbers (0.123ms)
// ✔ mathUtils > average > should handle negative numbers (0.045ms)
// ℹ tests 25
// ℹ suites 5
// ℹ pass 24
// ℹ fail 1
// ℹ cancelled 0
// ℹ skipped 0
// ℹ todo 0
// ℹ duration_ms 123.45
//
// ℹ ------------------------------------------------------------------
// ℹ file              | line % | branch % | funcs % | uncovered lines
// ℹ ------------------------------------------------------------------
// ℹ src               |        |          |         |
// ℹ  mathUtils.js     |  95.29 |    93.10 |  100.00 | 12-13 16-17
// ℹ  stringUtils.js   | 100.00 |   100.00 |  100.00 |
// ℹ  taskManager.js   | 100.00 |   100.00 |  100.00 |
// ℹ ------------------------------------------------------------------
// ℹ all files         |  98.54 |    97.65 |  100.00 |
// ℹ ------------------------------------------------------------------

/**
 * Run this script with `node scripts/compare-coverage-reports.js report1.txt report2.txt`
 */

import fs from "node:fs";
import path from "node:path";

function parseTestReport(reportContent) {
  const lines = reportContent.split("\n");
  const report = {
    testStats: {},
    coverage: {},
  };

  // Function to strip ANSI color codes
  const stripAnsi = (str) => str.replace(/\u001b\[\d+m/g, "");

  lines.forEach((line) => {
    const cleanLine = stripAnsi(line);

    // Parse test statistics (with ANSI color codes removed)
    const testStatMatch = cleanLine.match(
      /^\s*ℹ\s+(tests|suites|pass|fail|cancelled|skipped|todo|duration_ms)\s+(\d+(?:\.\d+)?)/,
    );
    if (testStatMatch) {
      const key = testStatMatch[1];
      const value =
        key === "duration_ms"
          ? parseFloat(testStatMatch[2])
          : parseInt(testStatMatch[2], 10);
      report.testStats[key] = value;
    }

    // Parse c8 coverage table format
    // Format: "File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s"
    // Example: " mathUtils.js |   95.29 |     93.1 |     100 |   95.29 | 12-13,16-17"
    const coverageMatch = cleanLine.match(
      /^\s*([a-zA-Z0-9_./]+\.js)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|/,
    );
    if (coverageMatch) {
      const filePath = coverageMatch[1].trim();
      const stmtsCoverage = parseFloat(coverageMatch[2]);
      const branchCoverage = parseFloat(coverageMatch[3]);
      const funcCoverage = parseFloat(coverageMatch[4]);
      const lineCoverage = parseFloat(coverageMatch[5]);

      report.coverage[filePath] = {
        line: lineCoverage,
        branch: branchCoverage,
        funcs: funcCoverage,
        stmts: stmtsCoverage,
      };
    }
  });

  return report;
}

function compareTestReports(report1Content, report2Content) {
  const report1 = parseTestReport(report1Content);
  const report2 = parseTestReport(report2Content);

  const allFiles = new Set([
    ...Object.keys(report1.coverage),
    ...Object.keys(report2.coverage),
  ]);

  const coverageComparison = [];

  allFiles.forEach((file) => {
    const cov1 = report1.coverage[file] || {
      line: 0,
      branch: 0,
      funcs: 0,
      stmts: 0,
    };
    const cov2 = report2.coverage[file] || {
      line: 0,
      branch: 0,
      funcs: 0,
      stmts: 0,
    };

    coverageComparison.push({
      file,
      report1: cov1,
      report2: cov2,
      difference: {
        stmts: cov2.stmts - cov1.stmts,
        branch: cov2.branch - cov1.branch,
        funcs: cov2.funcs - cov1.funcs,
        line: cov2.line - cov1.line,
      },
    });
  });

  return {
    testStats: {
      report1: report1.testStats,
      report2: report2.testStats,
    },
    coverageComparison,
  };
}

function printComparison(comparison) {
  console.log(`\n${"=".repeat(80)}`);
  console.log("TEST REPORT COMPARISON");
  console.log("=".repeat(80));

  // Print test statistics comparison
  console.log("\n📊 TEST STATISTICS:\n");
  const { testStats } = comparison;
  const stats1 = testStats.report1;
  const stats2 = testStats.report2;

  const statLabels = {
    tests: "Total Tests",
    suites: "Test Suites",
    pass: "Passed",
    fail: "Failed",
    cancelled: "Cancelled",
    skipped: "Skipped",
    todo: "Todo",
    duration_ms: "Duration (ms)",
  };

  console.log(
    `${"Metric".padEnd(20)} | ${"Report 1".padEnd(12)} | ${"Report 2".padEnd(12)} | ${"Difference".padEnd(12)}`,
  );
  console.log("-".repeat(65));

  Object.keys(statLabels).forEach((key) => {
    const val1 = stats1[key] || 0;
    const val2 = stats2[key] || 0;
    const diff = val2 - val1;
    const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
    const diffDisplay = diff === 0 ? "=" : diffStr;

    const val1Str = key === "duration_ms" ? val1.toFixed(2) : val1.toString();
    const val2Str = key === "duration_ms" ? val2.toFixed(2) : val2.toString();

    console.log(
      `${statLabels[key].padEnd(20)} | ${val1Str.padEnd(12)} | ${val2Str.padEnd(12)} | ${diffDisplay.padEnd(12)}`,
    );
  });

  // Print coverage comparison
  console.log("\n📈 COVERAGE COMPARISON:\n");
  console.log(
    `${"File".padEnd(25)} | ${"Metric".padEnd(12)} | ${"Report 1".padEnd(10)} | ${"Report 2".padEnd(10)} | ${"Diff".padEnd(10)}`,
  );
  console.log("-".repeat(80));

  comparison.coverageComparison.forEach(
    ({ file, report1, report2, difference }) => {
      const metrics = ["stmts", "branch", "funcs", "line"];
      const metricLabels = {
        stmts: "Statements",
        branch: "Branch",
        funcs: "Functions",
        line: "Lines",
      };

      metrics.forEach((metric, index) => {
        const fileDisplay = index === 0 ? file : "";
        const val1 = report1[metric].toFixed(2);
        const val2 = report2[metric].toFixed(2);
        const diff = difference[metric];
        const diffStr = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
        const diffDisplay = diff === 0 ? "=" : diffStr;

        console.log(
          `${fileDisplay.padEnd(25)} | ${metricLabels[metric].padEnd(12)} | ${val1.padEnd(10)} | ${val2.padEnd(10)} | ${diffDisplay.padEnd(10)}`,
        );
      });

      console.log("-".repeat(80));
    },
  );

  console.log("\n✅ Comparison complete!\n");
}

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error(
    "Usage: node scripts/compare-coverage-reports.js <report1.txt> <report2.txt>",
  );
  process.exit(1);
}

const [reportPath1, reportPath2] = args;

try {
  const reportContent1 = fs.readFileSync(path.resolve(reportPath1), "utf-8");
  const reportContent2 = fs.readFileSync(path.resolve(reportPath2), "utf-8");

  const comparison = compareTestReports(reportContent1, reportContent2);
  printComparison(comparison);
} catch (error) {
  console.error("Error reading test reports:", error.message);
  process.exit(1);
}
