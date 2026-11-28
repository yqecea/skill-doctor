# X post draft: skill-doctor

## Primary post

Agent harnesses never tell you when a skill is broken. I wrote a linter for that: skill-doctor checks frontmatter names, broken links and missing scripts across 8 harness layouts (.claude, .agents, .pi, .codex, .gemini, .opencode, .hermes, .automations).

Zero deps, one command: npx @yqecea/skill-doctor

https://github.com/yqecea/skill-doctor

## Shorter variant

skill-doctor lints agent skill directories across 8 harness layouts. It caught 2 real bugs in anthropics/skills and 4 in my own plugin before I published it. Zero dependencies.

npx @yqecea/skill-doctor

## Media to attach

- Terminal capture of `npx @yqecea/skill-doctor` running on anthropics/skills (record asciinema or screenshot the README benchmark table)
- README benchmark table screenshot: real skill collections, issue counts, zero false positives on clean corpora
