#!/usr/bin/env node
import { lint } from "./lint.mjs"

const args = process.argv.slice(2)
const json = args.includes("--json")
const dirs = args.filter((arg) => !arg.startsWith("-"))

if (args.includes("--help") || args.includes("-h")) {
  console.log("usage: skill-doctor [dir ...] [--json]")
  console.log("checks agent skill directories for frontmatter and link defects")
  process.exit(0)
}

const roots = dirs.length > 0 ? dirs : ["."]
let hadProblems = false
const report = []

for (const root of roots) {
  const { skills, problems } = lint(root)
  hadProblems = hadProblems || problems.length > 0
  report.push({ root, skills, problems })
}

if (json) {
  console.log(JSON.stringify(report, null, 2))
} else {
  for (const entry of report) {
    for (const problem of entry.problems) {
      console.log(`${problem.file}: ${problem.code}: ${problem.message}`)
    }
    console.log(`${entry.skills} skill(s) checked, ${entry.problems.length} problem(s)`)
  }
}

process.exit(hadProblems ? 1 : 0)
