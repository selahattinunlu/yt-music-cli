---
title: Volume Control
tags:
  - kb
  - task
task_id: TASK-011
status: partial
priority: P0
effort: S
user_value: 9
area: player
source_path: .plan/sprint-3/01-volume-control.md
---

# Volume Control

## Description

Kullanicinin `+` ve `-` tuslariyla ses seviyesini artirip azaltabilmesi.

> [!info]
> Kod incelemesinde ozelligin buyuk olcude uygulanmis oldugu goruldu. Ancak plan notundaki kabul kriteri `5` birim artis/azalis derken mevcut implementasyon `10` birim kullaniyor; bu nedenle durum `partial` olarak isaretlendi.

## Acceptance Criteria

- [ ] `+` tusu ses seviyesini 5 birim arttirir
- [ ] `-` tusu ses seviyesini 5 birim azaltir
- [x] Mevcut ses seviyesi player ekraninda gosterilir
- [x] Ses seviyesi 0-100 araliginda sinirlandirilir

## Technical Notes

- mpv IPC uzerinden `set_property volume` komutu kullaniliyor
- Player state'inde `volume` propertysi mevcut
- `observe_property` ile volume degisiklikleri dinleniyor

## Code Context

- Tus handler: `src/index.ts`
- Player IPC: `src/player.ts`
- UI gosterimi: `src/ui.ts`
