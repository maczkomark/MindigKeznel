# Mindig Kéznél – weboldal

Statikus, mobilra optimalizált egyoldalas weboldal. Nincs build-lépés: elég a fájlokat feltölteni.

## Fájlok
```
index.html        # az oldal váza + SEO + JSON-LD
style.css         # arculat (fekete / arany / fehér), reszponzív
script.js         # menü, smooth scroll, animációk, űrlap
assets/
  logo.svg          # tartalék (recreated) logó – működik azonnal
  logo.png          # << IDE tedd a VALÓDI MK logót
  van.svg           # tartalék hero illusztráció
  hero.jpg          # << IDE tedd a furgonos kártyát (hero kép)
  elotte-utanna.jpg # << IDE tedd az előtte-utánna bannert
  og-cover.jpg      # << közösségi megosztás borító (1200×630)
  favicon.svg       # böngésző-ikon
```

## Mit kell még pótolni (a chatben küldött 4 kép)

Mentsd le a képeket **pontosan ezekkel a nevekkel** az `assets/` mappába — utána
az oldal automatikusan a valódi képeket mutatja (addig a tartalék SVG/helykitöltő):

1. **MK shield logó** → `assets/logo.png`
   Lehetőleg **átlátszó hátterű PNG**, mert a fehér hátterű kép fehér téglalapként
   látszana a sötét fejlécen. (Amíg nincs PNG, a `logo.svg` jelenik meg.)
2. **Furgonos kártya** (fehér Sprinter + szolgáltatások) → `assets/hero.jpg`
3. **Előtte-utánna banner** → `assets/elotte-utanna.jpg`
4. **OG borítókép** (1200×630) → `assets/og-cover.jpg` (használható a furgonos kártya is)

Továbbiak:
5. **Facebook URL** — az `index.html`-ben két helyen `https://www.facebook.com/`
   (footer link + JSON-LD `sameAs`). Cseréld a valódi oldal címére.
6. **Saját domain** — az `index.html`-ben a `canonical` és `og:url`
   jelenleg `https://mindigkeznel.hu/`. Írd át a tényleges címre.

## Űrlap élesítése (jelenleg `mailto:` fallback)
A `Ajánlatkérés` űrlap alapból megnyitja a látogató levelezőjét. Éles fogadáshoz:

- **Formspree (legegyszerűbb):** regisztrálj a formspree.io-n, és az `index.html`-ben
  a `<form id="quoteForm" ... data-endpoint="">` attribútumba írd be:
  `data-endpoint="https://formspree.io/f/AZONOSITO"`.
- **EmailJS:** lásd a `script.js` tetején a kommentet (`EMAILJS` objektum + CDN script).

## Közzététel (GitHub Pages)
1. Töltsd fel a fájlokat egy GitHub repo gyökerébe.
2. Repo → **Settings → Pages → Branch: main / root → Save**.
3. Pár perc múlva él a `https://<felhasznalo>.github.io/<repo>/` címen.

(Cloudflare Pages-en is ugyanígy: csak kösd be a repót, build parancs nem kell.)
