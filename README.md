# skill-doctor

Lint agent skill directories. Finds every `SKILL.md` under a root, including harness skill folders (`.claude`, `.agents`, `.pi`, `.codex`, `.gemini`, `.opencode`, `.hermes`, `.automations`), and reports frontmatter and link defects.

Zero dependencies. Node 20+.

## Usage

```bash
# run straight from the repo
node src/cli.mjs [dir ...] [--json]

# or via npx once the package is published
npx @yqecea/skill-doctor ./my-repo
```

Exit code is 1 when any problem is found.

## GitHub Action

```yaml
- uses: yqecea/skill-doctor@v0.2.0
  with:
    path: .            # optional; space-separated list of roots
```

## Checks

- `no-frontmatter`, `unclosed-frontmatter`: the file does not open with a closed `---` block.
- `missing-name`, `bad-name`: no `name` field, or it is not lowercase kebab-case.
- `name-mismatch`: `name` does not equal the skill directory name.
- `missing-description`, `long-description`: no `description`, or over 1024 characters (Agent Skills spec limit).
- `duplicate-name`: two skills on the same tree declare the same `name`.
- `broken-link`: a relative markdown link target does not exist. Anchors are not validated.
- `no-skills`: no `SKILL.md` found under the root.

## Real-world runs

Measured on public skill corpora at the listed commit (v0.2.0):

| corpus | skills checked | problems | finding |
| --- | ---: | ---: | --- |
| [anthropics/skills](https://github.com/anthropics/skills) | 20 | 2 | `broken-link` in `skills/academy-guide` (a literal `URL` placeholder), `name-mismatch` in `template` |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | 3 | 0 | clean; `.automations/` workflow skills are linted, the `.vc` build cache is skipped |
| [chhoumann/t3-pstack](https://github.com/chhoumann/t3-pstack) | 66 | 0 | clean across `.claude`-style plugin layout |
| [yqecea/gem-swarm](https://github.com/yqecea/gem-swarm) | 51 | 4 | `name-mismatch` x2, `broken-link` x2; all fixed upstream in [3845b3d](https://github.com/yqecea/gem-swarm/commit/3845b3d) |

Reproduce with `node src/cli.mjs <path-to-clone>`.

## Scope

Frontmatter is read as top-level `key: value` pairs only; nested YAML blocks are tolerated but not validated. `node_modules`, `.git`, `dist`, `build`, and `coverage` are skipped; hidden directories are skipped unless they are a known harness skill folder.

## Development

```bash
node --test
```
