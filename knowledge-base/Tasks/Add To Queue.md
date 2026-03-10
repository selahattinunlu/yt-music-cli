---
title: Add To Queue
tags:
  - kb
  - task
task_id: TASK-007
status: planned
priority: P2
effort: M
user_value: 5
area: queue
source_path: .plan/sprint-2/07-add-to-queue.md
---

# Add To Queue

## Description

Arama sonuclarindan bir sarkiyi hemen calmak yerine kuyrugun basina veya sonuna ekleyebilme.

## Acceptance Criteria

- [ ] Arama sonuclarinda `Enter` ile cal, farkli bir tusla kuyrugun sonuna ekle
- [ ] `Sonraki olarak cal` davranisi ile kuyrugun basina ekleme
- [ ] Ekleme sonrasi kullaniciya gorsel geri bildirim verilmesi

## Technical Notes

- Arama sonuclari ekraninda yeni key binding'ler gerekli
- `queue` icin `unshift` ve `push` davranislari kullanilacak
