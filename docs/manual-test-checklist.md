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

## Genel

- [ ] S ile player'dan arama ekranina doner
- [ ] Q ile uygulamadan temiz cikis yapar
- [ ] Ctrl+C ile uygulamadan cikis yapar
