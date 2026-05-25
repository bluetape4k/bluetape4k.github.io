# GitHub Actions Dependabot Coverage

## Context

`bluetape4k-graph` received a grouped Dependabot pull request for GitHub
Actions updates, but this repository had no `.github/dependabot.yml`, so it
would not receive the same automated action-version updates.

## Decision

Add a GitHub Actions-only Dependabot configuration targeting `develop`. Keep
Gradle and Maven dependency updates out of leaf repositories because
`bluetape4k-dependencies` remains the central version-governance source.

## Outcome

Dependabot now checks GitHub Actions weekly and groups all action updates into
the `github-actions` group.

## Verification

- Parsed `.github/dependabot.yml` with Ruby YAML.
- Ran `git diff --check`.
- Workspace scan reported no repositories missing GitHub Actions Dependabot
  coverage.

## Future Guidance

When adding a workflow to a bluetape4k repository, verify that Dependabot has a
`github-actions` ecosystem entry and a grouped `github-actions` update rule.
