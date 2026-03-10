---
title: I18n Full Localization
tags:
  - kb
  - task
task_id: TASK-012
status: planned
priority: P2
effort: M
user_value: 6
area: ui
source_path: .plan/sprint-3/02-i18n.md
---

# I18n Full Localization

## Description

Uygulama arayuzunun birden fazla dili desteklemesi; tum UI metinlerinin merkezilesmis locale dosyalarindan gelmesi.

## Acceptance Criteria

- [ ] Tum UI metinleri tek bir yerden yonetilir
- [ ] Turkce (`tr`) ve Ingilizce (`en`) dil dosyalari olusturulur
- [ ] Sistem dili otomatik algilanir ve desteklenen bir dilse kullanilir
- [ ] Desteklenmeyen sistem dillerinde varsayilan dil `en` olur
- [ ] Kullanici config uzerinden dili manuel olarak secebilir
- [ ] Tum ekranlar cevirilmis metinlerle calisir

## Technical Notes

- Dil dosyalari `src/locales/tr.ts` ve `src/locales/en.ts` seklinde tutulabilir
- Basit key-value yapi yeterli
- Sistem dili `Intl.DateTimeFormat().resolvedOptions().locale` veya `process.env.LANG` ile alinabilir
- Kullanici tercihi `~/.config/yt-music-cli/config.json` icinde saklanabilir

## Related

- Daha erken ve daha dar kapsamli versiyon: [[I18n Foundation]]
