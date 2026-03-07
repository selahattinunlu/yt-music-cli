# Manuel Test Checklist

Her release oncesi bu listeyi kontrol et.
`bun run src/index.ts` ile uygulamayi baslat.

## Arama

- [ ] Sarki adi yazinca sonuclar listelenir
- [ ] Bos arama yapinca bir sey olmaz
- [ ] Sonuc bulunamazsa uyari gosterilir

## Arama Sonuclari

- [ ] UP/DOWN ile sonuclar arasinda gezinilir
- [ ] Enter ile secilen sarki calmaya baslar
- [ ] Q ile arama ekranina doner

## Player

- [ ] Secilen sarki basarili sekilde calar
- [ ] Sarki adi ekranda gosterilir
- [ ] Progress bar ilerler
- [ ] Sure bilgisi (gecen/toplam) dogru gosterilir
- [ ] Player ekrani titremeden guncellenir (flicker yok)

## Duraklat / Devam

- [ ] Space ile sarki duraklar
- [ ] Tekrar Space ile devam eder
- [ ] Durum metni degisir (Caliyor / Duraklatildi)

## Seek

- [ ] Sag ok ile 10 saniye ileri sarar
- [ ] Sol ok ile 10 saniye geri sarar

## Sonraki Sarki (N)

- [ ] N ile siradaki sarkiya gecer
- [ ] Queue bossa N bir sey yapmaz

## Onceki Sarki (P)

- [ ] P ile onceki sarkiya doner
- [ ] History bossa P bir sey yapmaz
- [ ] P ile geri donunce N ile tekrar ileriye gidebilir
- [ ] Birden fazla P ile sirayla geriye gidebilir

## Mix / Queue

- [ ] Sarki secildikten sonra mix yuklenir
- [ ] Sirada bekleyen sarkilar ekranda gosterilir
- [ ] Sarki bitince otomatik sonrakine gecer
- [ ] Queue azalinca yeni mix yuklenir

## Favoriler

- [ ] F ile calan sarki favorilere eklenir (kirmizi kalp gosterilir)
- [ ] F ile tekrar basilinca favorilerden cikarilir (kalp kaybolur)
- [ ] L ile favori listesi ekranina gidilir
- [ ] Favori listesinde UP/DOWN ile gezinilir
- [ ] Favori listesinde Enter ile sarki calinir
- [ ] Favori listesinde Q ile player'a geri doner
- [ ] Favoriler uygulama kapatilip acildiktan sonra da korunur
- [ ] Favori yokken L bir sey yapmaz
- [ ] Arama ekraninda (query bos iken) L ile favori listesine gidilir
- [ ] Arama ekraninda favori varsa "L  Favoriler" ipucu gosterilir
- [ ] Arama ekraninda playlist varsa "O  Playlistler" ipucu gosterilir
- [ ] Arama ekraninda (query bos iken) O ile playlist listesine gidilir
- [ ] Playlist yokken O bir sey yapmaz
- [ ] Favori listesinden Q ile arama ekranina geri doner (player yoksa)

## Playlistler

### Playlist Olusturma
- [ ] O ile playlist listesi ekranina gidilir
- [ ] Playlist listesi bos iken "Henuz playlist yok" mesaji gosterilir
- [ ] C ile yeni playlist olusturma ekranina gidilir
- [ ] Isim yazilip Enter ile playlist olusturulur
- [ ] Esc ile playlist olusturma iptal edilir
- [ ] Olusturulan playlist listede gosterilir

### Playlist'e Sarki Ekleme
- [ ] A ile calan sarki icin playlist secici acilir
- [ ] Playlist secici ekraninda sarkinin adi gosterilir
- [ ] UP/DOWN ile playlistler arasinda gezinilir
- [ ] Enter ile secilen playlist'e sarki eklenir
- [ ] Ayni sarki tekrar eklenmeye calisilirsa eklenmez (duplicate korunma)
- [ ] C ile playlist secici ekraninda yeni playlist olusturulabilir
- [ ] Q veya Esc ile playlist secici iptal edilip player'a donulur

### Playlist Goruntuleme
- [ ] O ile playlist listesi ekranina gidilir
- [ ] UP/DOWN ile playlistler arasinda gezinilir
- [ ] Enter ile playlist detayina gidilir
- [ ] Playlist detayinda sarkilar listelenir
- [ ] Bos playlist'te "Bu playlist bos" mesaji gosterilir
- [ ] Playlist detayinda UP/DOWN ile sarkilar arasinda gezinilir
- [ ] Playlist detayinda Enter ile sarki calinir

### Playlist Silme
- [ ] Playlist listesinde D ile playlist silinir
- [ ] Playlist detayinda D ile sarki playlistten silinir

### Playlist Yeniden Adlandirma
- [ ] Playlist listesinde R ile yeniden adlandirma ekranina gidilir
- [ ] Mevcut playlist ismi gosterilir ve uzerine yazilabilir
- [ ] Enter ile yeni isim kaydedilir ve playlist listesine donulur
- [ ] Esc ile isim degisikligi iptal edilir ve playlist listesine donulur
- [ ] Bos isim ile Enter'a basilinca bir sey olmaz
- [ ] Degisiklik uygulama kapatilip acildiktan sonra da korunur (playlists.json)
- [ ] Playlist yokken R bir sey yapmaz

### Playlist Navigasyon
- [ ] Playlist detayinda Q ile playlist listesine doner
- [ ] Playlist listesinde Q ile player'a doner (sarki caliyorsa)
- [ ] Playlist listesinde Q ile arama ekranina doner (sarki calmiyorsa)
- [ ] Playlistler uygulama kapatilip acildiktan sonra da korunur

## Shuffle (Karistirma)

- [ ] X ile shuffle modu acilir (ekranda 🔀 ikonu gosterilir)
- [ ] X ile tekrar basilinca shuffle kapanir (ikon kaybolur)
- [ ] Shuffle acildiginda mevcut kuyruk karistirilir
- [ ] Shuffle aktifken yeni mix yuklendiginde de karistirma uygulanir

## Genel

- [ ] S ile player'dan arama ekranina doner
- [ ] Q ile uygulamadan temiz cikis yapar
- [ ] Ctrl+C ile uygulamadan cikis yapar
