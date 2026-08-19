# Security History Cleanup — Runbook

The git history of this repo contained an LMS **admin password in cleartext**
plus admin screenshots with customer PII, under `.gstack/`, `.gstack-audit/`
and `.claude/`. The files have been removed from the current tree and are now
git-ignored, **but they still exist in older commits** (git history keeps every
version). This runbook removes them from all history.

> Verified: this exact procedure was tested on a mirror clone of this repo and
> left **0** commits containing the password, **0** with the admin email, and
> **0** `.gstack`/`.claude` paths in history, with all site files intact.

---

## Step 0 — Do this FIRST (most important)

**Rotate the LMS admin password now.** Once the password is changed, the leaked
value is worthless and the urgency drops dramatically. History rewriting is
hygiene; rotation is the actual fix. Also change it anywhere it was reused.

You may also want to delete the local copies still on your disk:

```bash
rm -rf .gstack .gstack-audit .claude
```

---

## Step 1 — Prerequisites

- Install git-filter-repo: `pip install git-filter-repo` (or `brew install git-filter-repo`).
- Coordinate: a history rewrite changes **every commit hash** after the first
  affected commit and requires a **force-push**. Everyone with a clone (and any
  automation/bot pushing to `main`) must re-clone or hard-reset afterwards.
  Make sure no one else is mid-push, then freeze pushes during the operation.

## Step 2 — Create the secret-replacement list (LOCAL ONLY — never commit it)

Create `replacements.txt` **outside** the repo (e.g. in your home dir) with the
real values on the left. Do not commit this file.

```
<the-leaked-password>==>***REMOVED-CREDENTIAL***
<the-leaked-admin-email>==>***REMOVED-EMAIL***
```

## Step 3 — Rewrite on a fresh mirror clone

```bash
# fresh mirror of the remote
git clone --mirror git@github.com:kalenacovers/faszienpraxis-fech.git fp-clean.git
cd fp-clean.git

git filter-repo --force --invert-paths \
  --path .gstack --path .gstack-audit --path .claude \
  --replace-text ~/replacements.txt
```

## Step 4 — Verify (all four must print 0 / show files intact)

```bash
git rev-list --all | while read c; do git grep -I -l "<the-leaked-password>" "$c"; done | wc -l   # -> 0
git rev-list --all | while read c; do git ls-tree -r --name-only "$c"; done | grep -cE '^\.(gstack|claude)'  # -> 0
git ls-tree -r --name-only main | grep -E 'index.html|api/gutschein.js'   # -> files listed
```

## Step 5 — Push the rewritten history

```bash
git push --force --mirror
```

Then **delete `~/replacements.txt`**, and have every collaborator re-clone:

```bash
# each teammate, after the rewrite:
git fetch origin && git reset --hard origin/main   # or simply re-clone
```

## Step 6 — Purge caches you don't control

- The old commits may still be reachable via **cached views, forks, and open
  PRs** on GitHub. After force-pushing, delete/rebase any PRs that referenced
  the old commits and, if needed, ask **GitHub Support** to purge the stale
  blob from cached views.
- Because the secret was public in history for a time, treat it as compromised
  regardless — Step 0 (rotation) is what actually protects you.

---

## Why this wasn't done automatically

A force-push that rewrites shared history is destructive and must be
coordinated by a human — especially here, where another process has been
pushing to `main`. Rotate the password (Step 0) whenever you like; run
Steps 1–6 during a quiet window when you can freeze pushes.
