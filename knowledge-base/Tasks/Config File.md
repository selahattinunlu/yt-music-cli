---
title: Config File
tags:
  - kb
  - task
task_id: TASK-004
status: planned
priority: P2
effort: M
user_value: 6
area: config
source_path: .plan/sprint-2/04-config-file.md
---

# Config File

## Description

Kullanici tercihlerinin kalici olarak saklanmasi.

## Acceptance Criteria

- [ ] `~/.config/yt-music-cli/config.json` dosyasi okunur
- [ ] Ayarlanabilir degerler: varsayilan ses seviyesi, arama limiti, kuyruk boyutu, dil
- [ ] Dosya yoksa varsayilan degerlerle olusturulur
- [ ] Gecersiz config durumunda varsayilanlara fallback yapilir

## Technical Notes

- Favori ve playlistlerle ayni config dizini kullanilir
- Uygulama basinda bir kez okunup global state'e alinmasi yeterli
