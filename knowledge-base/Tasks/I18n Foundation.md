---
title: I18n Foundation
tags:
  - kb
  - task
task_id: TASK-002
status: duplicate
priority: P2
effort: M
user_value: 5
area: ui
source_path: .plan/sprint-2/02-i18n.md
related_task: TASK-012
---

# I18n Foundation

## Description

UI'nin baslangic seviyesinde Turkce ve Ingilizce destekle calisabilmesi.

> [!note]
> Bu plan, daha kapsamli bir i18n task'i olan [[I18n Full Localization]] ile buyuk olcude cakisiyor. Bu nedenle tracker'da `duplicate` olarak isaretlendi.

## Acceptance Criteria

- [ ] Ingilizce ve Turkce dil destegi
- [ ] Sistem dili (`LANG` env) veya config dosyasindan dil secimi
- [ ] Tum UI metinleri dil dosyalarindan okunur
- [ ] Varsayilan dil Ingilizce

## Technical Notes

- `src/i18n/` dizini altinda `tr.ts` ve `en.ts` dosyalari
- Basit key-value yaklasimi yeterli, harici kutuphane gereksiz
- Config dosyasindan `lang` ayari okunacak
