# Show HN draft: skill-doctor

## Title

Show HN: skill-doctor, a linter for agent skill directories across 8 harness layouts

## Body

Every agent harness now has its own skill format: `.claude/skills`, `.agents/skills`, `.pi`, `.codex`, `.gemini`, `.opencode`, `.hermes`, `.automations`. They all share the same failure modes: a name in SKILL.md frontmatter that does not match the directory, broken relative links to reference files, scripts that do not exist. The harness never tells you; the skill just silently misbehaves or fails to load.

skill-doctor is a zero-dependency Node CLI that lints skill directories across all 8 layouts:

- frontmatter name must match the directory name
- relative links in SKILL.md must resolve
- referenced scripts and assets must exist

Run it on any repo: `npx @yqecea/skill-doctor`

Source: https://github.com/yqecea/skill-doctor

Why I trust it: I ran it against real skill collections before publishing. On anthropics/skills (20 skills) it flagged 2 genuine issues. On my own gem-swarm plugin (51 skills) it caught 2 name mismatches and 2 broken template links that I fixed upstream. On vercel-labs and t3-pstack collections (69 skills combined) it exits clean, so the false positive rate is low enough to gate CI on.

It also ships as a composite GitHub Action if you want skill linting as a CI check.

Zero dependencies, MIT, node:test suite. Feedback on layouts I missed is welcome.
