/* =========================================================
   Mindig Kéznél — script.js
   Vanilla JS, build-eszköz nélkül.
   - mobil menü
   - smooth scroll + sticky nav offset
   - scroll reveal animáció (IntersectionObserver)
   - űrlap validáció + küldés (Formspree / EmailJS / mailto fallback)
   ========================================================= */

/* ------- ÉLES KÜLDÉSHEZ (válassz egyet) -------------------
   A) FORMSPREE (ajánlott, legegyszerűbb):
      az index.html-ben a <form ... data-endpoint="https://formspree.io/f/AZONOSITO">
   B) EMAILJS:
      1) tedd be a <head>-be: <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
      2) állítsd be lent az EMAILJS objektumot (publicKey, serviceId, templateId)
   Ha egyik sincs beállítva -> mailto: linkre esik vissza (a felhasználó levelezője nyílik meg).
---------------------------------------------------------- */
const EMAILJS = { enabled: false, publicKey: "", serviceId: "", templateId: "" };

document.documentElement; // no-op
document.body.classList.add("js");

/* ---------- Évszám a láblécben ---------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Mobil menü ---------- */
const toggle = document.querySelector(".nav__toggle");
const mobileMenu = document.getElementById("mobileMenu");

if (toggle && mobileMenu) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
  };
  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setOpen(false))
  );
}

/* ---------- Smooth scroll (sticky nav magasság figyelembevételével) ---------- */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (id === "#" || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = document.querySelector(".nav")?.offsetHeight || 0;
    const y = target.getBoundingClientRect().top + window.pageYOffset - navH + 1;
    window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
  });
});

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll(".reveal");
if (prefersReduced || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // enyhe stagger a természetesebb hatásért
          setTimeout(() => entry.target.classList.add("is-visible"), Math.min(i * 60, 240));
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
}

/* ---------- Űrlap validáció + küldés ---------- */
const form = document.getElementById("quoteForm");
const statusEl = document.getElementById("formStatus");

const setError = (field, msg) => {
  const wrap = field.closest(".field");
  if (!wrap) return;
  wrap.classList.toggle("has-error", Boolean(msg));
  const err = wrap.querySelector(".field__error");
  if (err) err.textContent = msg || "";
};

const validators = {
  name: (v) => (v.trim().length >= 2 ? "" : "Kérjük, adja meg a nevét."),
  phone: (v) =>
    /^[+0-9 ()/-]{6,}$/.test(v.trim()) ? "" : "Adjon meg egy érvényes telefonszámot.",
  email: (v) =>
    v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? ""
      : "Érvénytelen e-mail cím.",
  service: (v) => (v ? "" : "Válasszon szolgáltatást."),
};

const validateField = (field) => {
  const fn = validators[field.name];
  if (!fn) return true;
  const msg = fn(field.value);
  setError(field, msg);
  return !msg;
};

if (form) {
  // validáció a mező elhagyásakor
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field")?.classList.contains("has-error")) validateField(field);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form__status";

    // minden kötelező mező ellenőrzése
    const fields = [...form.querySelectorAll("[required], #email")];
    let firstInvalid = null;
    let ok = true;
    fields.forEach((f) => {
      if (!validateField(f)) {
        ok = false;
        if (!firstInvalid) firstInvalid = f;
      }
    });
    if (!ok) {
      firstInvalid?.focus();
      statusEl.textContent = "Kérjük, javítsa a jelölt mezőket.";
      statusEl.classList.add("is-err");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const submitBtn = form.querySelector('button[type="submit"]');
    const endpoint = form.dataset.endpoint?.trim();
    const mailTo = form.dataset.mailto || "keznelmindig@gmail.com";

    const lock = (busy) => {
      if (!submitBtn) return;
      submitBtn.disabled = busy;
      submitBtn.textContent = busy ? "Küldés…" : "Ajánlatot kérek";
    };

    try {
      lock(true);

      if (endpoint) {
        // A) Formspree / saját endpoint
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error("network");
      } else if (EMAILJS.enabled && window.emailjs) {
        // B) EmailJS
        window.emailjs.init({ publicKey: EMAILJS.publicKey });
        await window.emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, data);
      } else {
        // C) mailto fallback — a felhasználó levelezője nyílik meg
        const subject = `Ajánlatkérés – ${data.service || "szolgáltatás"}`;
        const body =
          `Név: ${data.name}\n` +
          `Telefon: ${data.phone}\n` +
          `E-mail: ${data.email || "-"}\n` +
          `Szolgáltatás: ${data.service}\n\n` +
          `Üzenet:\n${data.message || "-"}`;
        window.location.href = `mailto:${mailTo}?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(body)}`;
        statusEl.textContent =
          "Megnyitottuk a levelezőjét a kész üzenettel — kérjük, küldje el. Vagy hívjon: 06 30 071 4854.";
        statusEl.classList.add("is-ok");
        lock(false);
        return;
      }

      form.reset();
      statusEl.textContent = "Köszönjük! Megkaptuk az ajánlatkérését, hamarosan visszahívjuk.";
      statusEl.classList.add("is-ok");
    } catch (err) {
      statusEl.textContent =
        "Hiba történt a küldés során. Kérjük, hívjon minket: 06 30 071 4854.";
      statusEl.classList.add("is-err");
    } finally {
      if (statusEl.classList.contains("is-ok")) {/* gomb maradhat */}
      lock(false);
    }
  });
}
