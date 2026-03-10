---
title: Search Screen Back
tags:
  - kb
  - task
task_id: TASK-010
status: planned
priority: P1
effort: S
user_value: 8
area: navigation
source_path: .plan/sprint-2/10-search-screen-back.md
---

# Search Screen Back

## Description

Arama ekranina gidildikten sonra vazgecildiginde onceki ekrana donebilme.

## Acceptance Criteria

- [ ] Arama ekraninda `Esc` ile onceki ekrana geri donulur
- [ ] Geri donuldugunde calan sarki etkilenmez
- [ ] Input'a yazi yazilmissa `Esc` ile temizlenmeden dogrudan geri donulur

## Technical Notes

- `search-input` state'inde geri donus davranisi tanimlanacak
- Sarki caliyorsa player'a, calmiyorsa uygun bos duruma donulecek
