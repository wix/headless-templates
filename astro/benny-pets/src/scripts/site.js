/**
 * Site-wide client behaviour. In the Next app these lived in `useEffect`s but
 * were pure DOM work, so they port to plain modules — no framework, no island.
 * Imported once from the layout; pages import the named helpers they need.
 */

const LETTER_TRANSITION = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)";

/** Ripple the letters of a wave container upward, one after another. */
export function triggerWave(container, amplitude = 14, stagger = 45) {
  const letters = container?.querySelectorAll(".wm-letter");
  if (!letters) return;
  letters.forEach((letter, i) => {
    clearTimeout(letter._waveTimer);
    letter._waveTimer = setTimeout(() => {
      letter.style.transform = `translateY(-${amplitude}px)`;
      setTimeout(() => {
        letter.style.transform = "translateY(0)";
      }, 320);
    }, i * stagger);
  });
}

/** Rebuild a wave element's letters — used when a label changes (cart count). */
export function setWaveText(container, text) {
  if (!container) return;
  container.textContent = "";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    if (ch === " ") {
      span.className = "wm-space";
    } else {
      span.className = "wm-letter";
      span.style.transition = `${LETTER_TRANSITION} ${i * 0.04}s`;
      span.textContent = ch;
    }
    container.appendChild(span);
  });
}

let toastTimer;
export function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}

/** POST JSON to one of the /api routes and return the parsed body. */
export async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

/** Update every cart label on the page (nav links carry wave letters). */
export function setCartCount(count) {
  document.querySelectorAll("[data-cart-label]").forEach((el) => {
    setWaveText(el, count > 0 ? `Cart (${count})` : "Cart");
  });
}

function initCursor() {
  const cursor = document.getElementById("cursor");
  if (!cursor) return;
  let raf = 0;
  window.addEventListener(
    "mousemove",
    (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        cursor.style.transform = `translate(${e.clientX - 7}px,${e.clientY - 7}px)`;
      });
    },
    { passive: true },
  );
  // Delegated so it also covers markup added after load (cart re-renders).
  document.addEventListener("mouseover", (e) => {
    if (e.target?.closest?.("a,button")) cursor.classList.add("expanded");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target?.closest?.("a,button")) cursor.classList.remove("expanded");
  });
}

function initReveal() {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll(".animate-in, .blur-word").forEach((el) => io.observe(el));
}

function initWaves() {
  document.querySelectorAll("[data-wave]").forEach((el) => {
    el.addEventListener("mouseenter", () =>
      triggerWave(el, Number(el.dataset.waveAmp) || 14, Number(el.dataset.waveStagger) || 45),
    );
  });
}

/** The welcome paragraph: hovering a letter lifts its neighbours less and less. */
function initWelcomeLetters() {
  document.querySelectorAll(".blur-word").forEach((word) => {
    const letters = [...word.querySelectorAll(".w-letter")];
    letters.forEach((letter, index) => {
      letter.addEventListener("mouseenter", () => {
        letters.forEach((other, i) => {
          clearTimeout(other._welcomeTimer);
          const distance = Math.abs(i - index);
          const amplitude = Math.max(3, 12 - distance * 3);
          other._welcomeTimer = setTimeout(() => {
            other.style.transform = `translateY(-${amplitude}px)`;
            setTimeout(() => {
              other.style.transform = "translateY(0)";
            }, 300);
          }, distance * 40);
        });
      });
    });
  });
}

initCursor();
initReveal();
initWaves();
initWelcomeLetters();
