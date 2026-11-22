# skill-doctor

Lint agent skill directories. Finds every `SKILL.md` under a root, including harness skill folders (`.claude`, `.agents`, `.pi`, `.codex`, `.gemini`, `.opencode`), and reports frontmatter and link defects.

Zero dependencies. Node 20+.

## Usage

```bash
node src/cli.mjs [dir ...] [--json]
# or, once linked:
skill-doctor ./my-repo
```

Exit code is 1 when any problem is found.

## Checks

- `no-frontmatter`, `unclosed-frontmatter`: the file does not open with a closed `---` block.
- `missing-name`, `bad-name`: no `name` field, or it is not lowercase kebab-case.
- `name-mismatch`: `name` does not equal the skill directory name.
- `missing-description`, `long-description`: no `description`, or over 1024 characters (Agent Skills spec limit).
- `duplicate-name`: two skills on the same tree declare the same `name`.
- `broken-link`: a relative markdown link target does not exist. Anchors are not validated.
- `no-skills`: no `SKILL.md` found under the root.

## Scope

Frontmatter is read as top-level `key: value` pairs only; nested YAML blocks are tolerated but not validated. `node_modules`, `.git`, `dist`, `build`, and `coverage` are skipped.

## Development

```bash
node --test
```
