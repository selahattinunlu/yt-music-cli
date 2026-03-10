---
title: Releasing a New Version
tags:
  - kb
  - devops
---

# Releasing a New Version

## Overview

Releases are automated via GitHub Actions. Pushing a version tag triggers a workflow that builds binaries for all platforms and publishes them to npm.

## Steps

### 1. Make sure everything works locally

```sh
bun run dev
```

### 2. Build all platform binaries

```sh
bun run build
```

Verify the output:

```
npm/darwin-arm64/bin/yt-music
npm/darwin-x64/bin/yt-music
npm/linux-x64/bin/yt-music
npm/linux-arm64/bin/yt-music
npm/win32-x64/bin/yt-music.exe
```

### 3. Bump the version

Update the version in `package.json` and all platform packages under `npm/*/package.json`. All must have the same version.

Or use npm to bump automatically:

```sh
# patch: 0.1.0 → 0.1.1 (bug fixes)
npm version patch

# minor: 0.1.0 → 0.2.0 (new features)
npm version minor

# major: 0.1.0 → 1.0.0 (breaking changes)
npm version major
```

### 4. Commit and push

```sh
git add .
git commit -m "chore: release v0.x.x"
git push origin main
```

### 5. Push a version tag

This is what triggers the GitHub Actions release workflow.

```sh
git tag v0.x.x
git push origin v0.x.x
```

The workflow will:
1. Build binaries for all platforms
2. Publish each platform package to npm
3. Publish the main `yt-music-cli` package to npm

### 6. Verify the release

```sh
npm info yt-music-cli
```

Check that the latest version matches what you just published.

## Manual publishing (if needed)

If the workflow fails, you can publish manually:

```sh
bun run build

cd npm/darwin-arm64 && npm publish --access public && cd ../..
cd npm/darwin-x64 && npm publish --access public && cd ../..
cd npm/linux-x64 && npm publish --access public && cd ../..
cd npm/linux-arm64 && npm publish --access public && cd ../..
cd npm/win32-x64 && npm publish --access public && cd ../..

npm publish --access public
```

## Notes

- Platform packages must be published **before** the main package.
- All packages must share the same version number.
- The `NPM_TOKEN` secret must be set in GitHub repository settings under **Settings → Secrets and variables → Actions**.
