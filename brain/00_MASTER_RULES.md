# 00 MASTER RULES

## Source of Truth Hierarchy
1. **Existing Codebase & Configuration**: What is actually implemented and working.
2. **Project Brain (`brain/`)**: Architectural, design, and procedural specifications.
3. **Explicit User Instructions**: Real-time direction, overrides, and requirement clarifications.

If code and documentation disagree, inspect the implementation and requirements, determine which is authoritative, and reconcile them immediately. Never allow documentation to contradict actual implementation.

---

## 1. Development Principles
- **Smallest Correct Change**: Always determine and apply the minimal sufficient change to achieve the objective without regressions or unnecessary bloat.
- **Inspect Before Modifying**: Never assume. Check existing code, configuration, and dependencies before proposing or making edits.
- **No Unprompted Feature Creep**: Implement only what has been requested or approved. Do not add unrequested third-party packages, frameworks, or speculative abstractions.

---

## 2. Coding Rules
- Maintain high code clarity, modularity, and strict type safety (where supported by the chosen language).
- Follow standard idioms and formatting conventions established for the selected tech stack.
- Preserve existing comments, docstrings, and architectural patterns unless explicitly directed to refactor.

---

## 3. Security Rules
- **Zero Secret Commits**: Never store secrets, API keys, credentials, or private certificates in code repositories. Use secure environment configuration.
- **Defensive Input Handling**: Sanitize and validate all external inputs (user inputs, URL params, network payloads).
- **Least Privilege**: Grant minimal necessary permissions to processes, tokens, and storage components.

---

## 4. Change Rules
- All changes must be scoped, verifiable, and documented.
- Before implementing any feature or architectural shift:
  1. Read relevant `brain/` documents.
  2. Inspect the current code.
  3. Formulate the smallest correct change.
  4. Implement and verify.
  5. Update `brain/` documents (`15_MICROTASKS.md`, `16_CHANGELOG.md`, `17_DECISIONS.md`, and relevant specs).

---

## 5. Testing & Verification Requirements
- Every implemented feature or bug fix must be accompanied by appropriate verification (automated tests or explicit manual verification steps).
- Do not mark tasks as complete in `15_MICROTASKS.md` until verification passes.
- Maintain test suite health: tests must be deterministic and runnable via reproducible commands.

---

## 6. Documentation Rules
- Documentation must accurately reflect reality at all times.
- If a decision or technical detail is unknown or undecided, mark it explicitly as `[NOT YET DEFINED]` or `[TO BE DECIDED]`.
- Keep `16_CHANGELOG.md` updated chronologically with every significant milestone or change.

---

## 7. Dependency Rules
- Evaluate existing capabilities before introducing new external dependencies.
- Pin dependency versions where appropriate to ensure reproducible builds.
- Never install packages without clear justification and alignment with the project stack.

---

## 8. Database & Data Safety Rules
- Any data mutations, schema migrations, or persistence layers must safeguard against data loss and corruption.
- Write operations must validate data constraints prior to persistence.

---

## 9. AI-Agent Working Rules
- Follow instructions strictly without assuming missing domain rules.
- Do not rewrite existing working code unless instructed or required for the task.
- Never execute destructive or irreversible commands without explicit approval.
- Maintain full traceability across tasks, decisions, and codebase modifications.
