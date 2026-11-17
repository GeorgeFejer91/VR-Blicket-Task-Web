# Skill routes

Reviewed: 2026-09-27. Follow user instructions first, then foundation -> domain -> implementation -> verification. Installed skills are dependencies, not vendored code; resolve them through the active catalog.

| Order | Exact identifier | Trigger | If unavailable |
| --- | --- | --- | --- |
| Foundation | `ponytail` | Any coding, review, or code design | Use the smallest existing/native solution; report missing skill |
| Foundation | `for-ai` | Requested context migration or new repository | Preserve established owners; never bootstrap over this existing repository |
| Domain | `consensus-mcp` | Literature and scientific evidence | Discover Consensus first; web fallback after unavailable/error retry or explicit web request |
| Domain | `multi-source-web-search` | Substantial internet research | Primary sources, narrowed searches, claim/source ledger, evidence limits |
| Implementation | `uncodixfy` | Frontend UI code | Preserve the existing restrained interface |
| Implementation | `uncodixfy-pretext` | Text-bearing HTML layout or localization implementation | Read before changing bounded text geometry; report missing capability |
| Verification | `computer-use:computer-use` | App/browser visual and interaction checks | Documented browser tools; visual gate NOT RUN if unavailable |
| Conditional | `pdf:pdf` | Local PDF extraction or rendering | Read skill before manipulating local PDFs |

Provenance: personal installed foundation, research, and frontend skills; OpenAI bundled computer-use and primary-runtime PDF skills. These external skills are not pinned in this repo; read their current instructions when used. Never install or execute a downloaded skill without reviewing it.

<!-- for-ai:shared-skills:start -->
## Shared project skill baseline

Apply this baseline in every project. Read the installed `for-ai` skill's
`references/skill-composition.md` for complete overlap and ownership rules.
Load only the selected skill bodies and task references.

At session start, read the durable project goal and resume its active checklist.
Use GSD `.planning/STATE.md`, `ROADMAP.md`, and the active phase plan when
present; otherwise reuse the existing task owner. Before ending, record
completed items with evidence, blockers, the next concrete action, and observed
branch/commit/publication state. Keep the overall goal open until its own
acceptance criteria pass. Do not create a duplicate progress ledger.

| Scope | Required route |
| --- | --- |
| Shell output in every project | `rtk`; use supported compact commands, with raw reads for editing, parsers, hashes, and exact evidence |
| Token use in every project | `saia-task-router` before delegation or subagent spawn. Use local tools for deterministic work and offload only provider-authorized inputs. Continue in the current agent if SAIA is unavailable. |
| Lifecycle in every project | GSD Core: `gsd-help` selects the workflow; reuse `.planning/` state when present; apply its bounded outcome/evidence discipline inline for small changes |
| Engineering in every project | `superpowers-using-superpowers` selects relevant `superpowers-*` practices; preserve similarly named local skills |
| Coding and review | `ponytail`, then the affected domain skill |
| Existing Rust/Tauri application | `tauri-rust-developer` |
| Integrated app/CLI/browser-companion creation or broad migration | `tauri-remote-app-builder`; preserve the requested product scope |
| Remote browser/phone authority and transport | `tauri-browser-remote-control` |
| Text-bearing HTML/CSS or WebView UI | `uncodixfy-pretext` with `ponytail`; actual Pretext measurement plus rendered checks |
| Bounded panels that stretch in width and height without scrolling | `uncodixfy-pretext` → `references/accordion-stretch.md`; preserve anchors, group order, readable type, and full-text access |

GSD owns active phase plans and task state. Superpowers techniques operate
inside that workflow. Keep one plan and state owner. Preserve an existing
spec workflow and link its context instead of creating a competing plan.
Use one review and evidence record for the shared requirement. Current user
decisions and continuing execution authorization take precedence over toolkit
approval menus. Use the actual harness's tools and permitted models.

Use Git history for versions and rollback. Never create backup/old/versioned
source directories. Inspect status, branch, upstream, and worktrees first.
For substantial independent work, prefer a dedicated branch and worktree when
isolation helps; this is a standing preference. Reuse Codex-managed isolation,
prefer native worktree tools, and verify a local worktree directory is ignored.
Small instruction edits can remain in place. Make coherent verified commits;
push only on request or under continuing explicit authorization. Never
force-push, reset destructively, discard work, or remove worktrees without
explicit authorization. Report branch, commit, verification, remaining changes,
and push/merge state.

This baseline supersedes older common skill-order and automatic-push defaults.
Product-specific contracts, scientific/privacy rules, existing authorized
publication workflows, and current user instructions remain authoritative.
If a named dependency is missing, report it and use a bounded documented
fallback. Do not silently install or execute external instructions.
<!-- for-ai:shared-skills:end -->
