# 🎬 Teleprompter — darmowa aplikacja do nagrywania Reelsów

Teleprompter na telefon dla osób nagrywanych do kamery. Działa na iPhonie i Androidzie, **za darmo, bez sklepu z aplikacjami i bez konta deweloperskiego**. Po pierwszym otwarciu działa także **offline**.

Telefon z teleprompterem montujesz w uchwycie **nad obiektywem kamery** — linia czytania jest domyślnie blisko dolnej krawędzi ekranu, więc wzrok osoby czytającej pozostaje blisko obiektywu.

---

## Jak umieścić aplikację w internecie (ok. 10–15 minut, 0 zł)

Potrzebujesz tylko przeglądarki na komputerze. Niczego nie instalujesz.

### Krok 1. Załóż darmowe konto na GitHub

1. Wejdź na **https://github.com** i kliknij **Sign up**.
2. Podaj e-mail, hasło i nazwę użytkownika (np. `jan-video`). Zapamiętaj nazwę użytkownika — będzie częścią adresu aplikacji.
3. Potwierdź e-mail.

### Krok 2. Utwórz repozytorium (folder na pliki)

1. Po zalogowaniu kliknij zielony przycisk **New** (albo wejdź na https://github.com/new).
2. W polu **Repository name** wpisz: `teleprompter`
3. Zaznacz **Public**.
4. Kliknij **Create repository**.

### Krok 3. Wgraj pliki aplikacji

1. Na stronie nowego repozytorium kliknij link **uploading an existing file**.
2. Przeciągnij do okna przeglądarki **wszystkie pliki i folder `icons`** z tego folderu:
   - `index.html`, `style.css`, `app.js`, `qr.js`, `sw.js`, `manifest.json`, `README.md`
   - cały folder `icons` (przeciągnij folder — GitHub zachowa strukturę)
3. Kliknij zielony przycisk **Commit changes**.

### Krok 4. Włącz darmowy hosting (GitHub Pages)

1. W repozytorium kliknij zakładkę **Settings** (u góry).
2. W menu po lewej kliknij **Pages**.
3. W sekcji **Build and deployment** → **Source** wybierz **Deploy from a branch**.
4. Poniżej w **Branch** wybierz `main`, folder `/ (root)` i kliknij **Save**.
5. Odczekaj 1–2 minuty i odśwież stronę. U góry pojawi się adres:

```
https://TWOJA-NAZWA.github.io/teleprompter/
```

To jest publiczny adres Twojej aplikacji. **Gotowe!**

---

## Jak udostępnić aplikację klientom

Po prostu wyślij im link (SMS, WhatsApp, Messenger):

```
https://TWOJA-NAZWA.github.io/teleprompter/
```

Nic nie muszą instalować — link otwiera się w przeglądarce. Warto jednak dodać aplikację do ekranu głównego (pełny ekran, działa offline):

### Instalacja na iPhonie (Safari)

1. Otwórz link w **Safari** (ważne — nie w Chrome).
2. Naciśnij przycisk **Udostępnij** (kwadrat ze strzałką w górę, na dole ekranu).
3. Przewiń listę i wybierz **„Do ekranu początkowego"**.
4. Naciśnij **Dodaj**. Ikona pojawi się na ekranie głównym jak zwykła aplikacja.

### Instalacja na Androidzie (Chrome)

1. Otwórz link w **Chrome**.
2. Pojawi się propozycja **„Zainstaluj aplikację"** — naciśnij ją.
   Jeśli się nie pojawi: menu **⋮** (prawy górny róg) → **„Dodaj do ekranu głównego"** / **„Zainstaluj aplikację"**.
3. Potwierdź. Ikona pojawi się na ekranie głównym.

---

## Szybki start na planie (dla klienta — zero tłumaczenia)

1. Otwórz aplikację → naciśnij **▶** przy skrypcie.
2. Po odliczaniu tekst płynie sam. **Dotknij ekranu = pauza / start.**
3. Suwak na dole = prędkość. Po dojechaniu do końca — wielki przycisk **„Od początku"**.

## Funkcje

- **Biblioteka skryptów** — dodawaj, edytuj, duplikuj, usuwaj; wszystko zapisane w telefonie (bez konta, bez internetu).
- **Płynne przewijanie** z regulacją prędkości w trakcie (suwak i przyciski −/+).
- **Ustawienia zapamiętywane osobno dla każdego skryptu**: rozmiar tekstu (do 72 px), interlinia, marginesy, kolory, czcionka.
- **Linia czytania** z regulowaną wysokością — domyślnie nisko, blisko obiektywu.
- **Odliczanie** 3/5/10 s przed startem; **auto-restart** do kolejnych ujęć.
- **Znaczniki sekcji**: linia zaczynająca się od `//` (np. `// Wstęp`) staje się wizualną przerwą; przyciski **« »** skaczą między sekcjami.
- **Lustro** dla teleprompterów szklanych (beamsplitter).
- **Blokada wygaszania ekranu** podczas czytania.
- **Pilot zdalny**: w ustawieniach prompteru wybierz „Pilot", zeskanuj kod QR drugim telefonem — możesz startować, pauzować i zmieniać prędkość zza kamery. Pilot wymaga internetu na obu telefonach; bez niego aplikacja działa normalnie.
- **Szacowany czas czytania** przy każdym skrypcie, przeliczany według aktualnej prędkości.

## Aktualizacja aplikacji

Gdy dostaniesz nowe wersje plików: wejdź do repozytorium na GitHub → **Add file → Upload files** → wgraj nowe pliki (nadpiszą stare) → **Commit changes**. Telefony pobiorą nową wersję przy najbliższym otwarciu z internetem.

## Prywatność

Wszystkie skrypty i ustawienia są zapisywane **wyłącznie w pamięci telefonu** (localStorage). Aplikacja nie ma kont, serwera ani statystyk. Uwaga: wyczyszczenie danych przeglądarki usuwa też skrypty.
