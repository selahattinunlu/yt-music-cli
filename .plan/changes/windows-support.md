# Windows Desteği

## 1. Windows binary'sini publish et

npm spam detection'dan dolayı publish edilemedi. Birkaç saat/gün bekleyip tekrar dene:

```sh
cd npm/win32-x64 && npm publish --access public && cd ../..
```

Hâlâ olmazsa npm support'a yaz: https://npmjs.com/support
> "Package name triggered spam detection, trying to publish yt-music-cli-win32-x64"

## 2. Ana paketi yeni versiyon ile publish et

Windows optionalDependency eklendi, versiyon bump gerekiyor:

```sh
npm version patch
npm publish --access public
```

## 3. Platform hata mesajlarını düzelt

`src/index.ts`'deki `main()` fonksiyonunda eksik dependency mesajları sadece `brew install` gösteriyor.
Windows kullananlar için platforma göre doğru komutu göster:

```ts
// Şu an:
if (!hasMpv) console.error('  ✗ mpv  →  brew install mpv');
if (!hasYtdlp) console.error('  ✗ yt-dlp  →  brew install yt-dlp');

// Olması gereken: process.platform'a göre farklı mesaj
// darwin/linux → brew / apt
// win32        → winget install mpv.mpv / winget install yt-dlp.yt-dlp
```

## 4. README'i güncelle

Windows binary publish edildikten sonra README'deki "Coming soon" notunu kaldır (eğer eklendiyse).
