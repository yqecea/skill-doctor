import { existsSync, readdirSync, readFileSync } from "node:fs"
import { basename, join, resolve } from "node:path"

const SKILL_FILE = "SKILL.md"
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage"])
const SKILL_HOST_DIRS = new Set([".claude", ".agents", ".pi", ".codex", ".gemini", ".opencode"])

function* walk(dir) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && !SKILL_HOST_DIRS.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      if (existsSync(join(path, SKILL_FILE))) yield path
      else yield* walk(path)
    }
  }
}

function parseFrontmatter(text, file) {
  const problems = []
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) {
    problems.push({ file, code: "no-frontmatter", message: "SKILL.md does not open with a --- frontmatter block" })
    return { data: {}, problems }
  }
  const end = text.indexOf("\n---", 4)
  if (end === -1) {
    problems.push({ file, code: "unclosed-frontmatter", message: "frontmatter block is not closed" })
    return { data: {}, problems }
  }
  const block = text.slice(text.indexOf("\n") + 1, end)
  const data = {}
  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trimEnd()
    if (line === "" || line.startsWith("#")) continue
    if (/^\s/.test(rawLine) || rawLine.trimStart().startsWith("- ")) continue
    const match = /^([A-Za-z0-9_-]+):(.*)$/.exec(rawLine)
    if (!match) {
      problems.push({ file, code: "bad-frontmatter-line", message: `cannot parse frontmatter line: ${line.trim()}` })
      continue
    }
    const [, key, rest] = match
    data[key] = rest.trim().replace(/^["']|["']$/g, "")
  }
  return { data, problems }
}

function checkSkill(dir, root, seen) {
  const file = join(dir, SKILL_FILE)
  const rel = file.slice(root.length + 1)
  const problems = []
  const text = readFileSync(file, "utf8")
  const { data, problems: fmProblems } = parseFrontmatter(text, rel)
  problems.push(...fmProblems)

  const name = data.name
  if (name === undefined || name === "") {
    problems.push({ file: rel, code: "missing-name", message: "frontmatter has no name field" })
  } else {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
      problems.push({ file: rel, code: "bad-name", message: `name "${name}" is not lowercase kebab-case` })
    }
    if (name !== basename(dir)) {
      problems.push({ file: rel, code: "name-mismatch", message: `name "${name}" does not match directory "${basename(dir)}"` })
    }
    if (seen.has(name)) {
      problems.push({ file: rel, code: "duplicate-name", message: `name "${name}" also used by ${seen.get(name)}` })
    } else {
      seen.set(name, rel)
    }
  }

  const description = data.description
  if (description === undefined || description === "") {
    problems.push({ file: rel, code: "missing-description", message: "frontmatter has no description field" })
  } else if (description.length > 1024) {
    problems.push({ file: rel, code: "long-description", message: `description is ${description.length} characters, over the 1024 limit` })
  }

  const linkRe = /\[[^\]]*\]\(([^)\s]+)\)/g
  let link
  while ((link = linkRe.exec(text)) !== null) {
    const target = link[1].split("#")[0]
    if (target === "" || /^[a-z]+:/.test(target)) continue
    const resolved = resolve(dir, target)
    if (!existsSync(resolved)) {
      problems.push({ file: rel, code: "broken-link", message: `markdown link target does not exist: ${target}` })
    }
  }

  return problems
}

export function lint(root) {
  const abs = resolve(root)
  const problems = []
  const seen = new Map()
  let count = 0
  for (const dir of walk(abs)) {
    count += 1
    problems.push(...checkSkill(dir, abs, seen))
  }
  if (count === 0) {
    problems.push({ file: ".", code: "no-skills", message: "no SKILL.md found under this directory" })
  }
  return { skills: count, problems }
}

export const internals = { walk, parseFrontmatter, checkSkill }
