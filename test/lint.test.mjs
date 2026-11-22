import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, before, describe, it } from "node:test"
import assert from "node:assert/strict"
import { lint } from "../src/lint.mjs"

let root
before(() => {
  root = mkdtempSync(join(tmpdir(), "skill-doctor-"))
})
after(() => {
  rmSync(root, { recursive: true, force: true })
})

function skill(path, frontmatter, body = "Body text.") {
  const dir = join(root, path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, "SKILL.md"), `---\n${frontmatter}\n---\n${body}\n`)
}

function codes(problems) {
  return problems.map((p) => p.code).sort()
}

describe("lint", () => {
  it("reports no problems for a well-formed skill", () => {
    skill("ok-skill/good-skill", "name: good-skill\ndescription: Does a thing.")
    const dir = join(root, "ok-skill")
    const { skills, problems } = lint(dir)
    assert.equal(skills, 1)
    assert.deepEqual(problems, [])
  })

  it("finds skills inside harness dirs like .claude/skills", () => {
    skill("harness/.claude/skills/inner-skill", "name: inner-skill\ndescription: Nested.")
    const { skills, problems } = lint(join(root, "harness"))
    assert.equal(skills, 1)
    assert.deepEqual(problems, [])
  })

  it("flags a missing frontmatter block", () => {
    const dir = join(root, "no-fm/bad")
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, "SKILL.md"), "# just markdown\n")
    const { problems } = lint(join(root, "no-fm"))
    assert.ok(codes(problems).includes("no-frontmatter"))
    assert.ok(codes(problems).includes("missing-name"))
  })

  it("flags a name that does not match the directory", () => {
    skill("mismatch/other-name", "name: not-the-dir\ndescription: Mismatch.")
    const { problems } = lint(join(root, "mismatch"))
    assert.ok(codes(problems).includes("name-mismatch"))
  })

  it("flags a non kebab-case name", () => {
    skill("cased/Up_Skill", "name: Up_Skill\ndescription: Cased.")
    const { problems } = lint(join(root, "cased"))
    assert.ok(codes(problems).includes("bad-name"))
  })

  it("flags a missing description", () => {
    skill("nodesc/nodesc", "name: nodesc")
    const { problems } = lint(join(root, "nodesc"))
    assert.ok(codes(problems).includes("missing-description"))
  })

  it("flags duplicate skill names across dirs", () => {
    skill("dups/a/shared", "name: shared\ndescription: One.")
    skill("dups/b/shared", "name: shared\ndescription: Two.")
    const { problems } = lint(join(root, "dups"))
    assert.ok(codes(problems).includes("duplicate-name"))
  })

  it("flags broken relative links and accepts good ones", () => {
    skill("links/linker", "name: linker\ndescription: Links.", "[ok](doc.md) [missing](gone.md)")
    writeFileSync(join(root, "links/linker/doc.md"), "# doc\n")
    const { problems } = lint(join(root, "links"))
    assert.equal(problems.length, 1)
    assert.equal(problems[0].code, "broken-link")
    assert.ok(problems[0].message.includes("gone.md"))
  })

  it("accepts links to files through anchors and pure anchors", () => {
    skill("anchors/anchored", "name: anchored\ndescription: Anchors.", "[a](doc.md#section) [b](#top)")
    writeFileSync(join(root, "anchors/anchored/doc.md"), "# doc\n")
    const { problems } = lint(join(root, "anchors"))
    assert.deepEqual(problems, [])
  })

  it("skips node_modules and report no-skills on an empty tree", () => {
    skill("empty/node_modules/sneaky", "name: sneaky\ndescription: Hidden.")
    const { skills, problems } = lint(join(root, "empty"))
    assert.equal(skills, 0)
    assert.ok(codes(problems).includes("no-skills"))
  })

  it("reports a description over 1024 characters", () => {
    skill("long/longdesc", `name: longdesc\ndescription: ${"x".repeat(1100)}`)
    const { problems } = lint(join(root, "long"))
    assert.ok(codes(problems).includes("long-description"))
  })

  it("tolerates nested YAML blocks in frontmatter", () => {
    skill("nested/nested", "name: nested\ndescription: Nested.\nmetadata:\n  openclaw:\n    requires:\n      bins:\n        - node\n    envVars:\n      - name: KEY\n        required: false")
    const { problems } = lint(join(root, "nested"))
    assert.deepEqual(problems, [])
  })
})
