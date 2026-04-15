// =========================
// PLAUSIBLE EVENTS
// =========================

function track(event, props) {
  if (typeof window.plausible === "function") {
    window.plausible(event, props ? { props } : undefined)
  }
}


// =========================
// APP-LOGIK (Shopping AI MVP)
// =========================

// Import der Rezept-Daten
import { recipes } from "./recipes.js"


// =========================
// UI HILFSFUNKTIONEN
// =========================

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"))
  document.getElementById(id).classList.remove("hidden")
}


// =========================
// NUTZUNGSLIMIT (5x kostenlos)
// =========================

function getUsage() {
  return Number(localStorage.getItem("usage") || 0)
}

function increaseUsage() {
  localStorage.setItem("usage", getUsage() + 1)
}

function showPaywallBanner() {
  const banner = document.getElementById("paywall-banner")
  if (banner) banner.classList.remove("hidden")
}


// =========================
// PARSER (einfache Logik statt AI)
// =========================

const DISH_KEYWORDS = {
  bolognese: [
    "bolognese", "hacksoße", "hackfleischsoße", "fleischsoße",
    "pasta bolognese", "spaghetti bolognese"
  ],
  kartoffelbrot: [
    "kartoffelbrot", "kartoffel brot", "kartoffel", "brot backen",
    "brot mit kartoffel"
  ],
  zwiebelkuchen: [
    "zwiebelkuchen", "zwiebel kuchen", "zwiebelkuche", "zwiebelkuche",
    "zwiebelkuchen backen"
  ],
  frikadellen: [
    "frikadelle", "frikadellen", "bulette", "buletten",
    "hackbraten", "hack braten", "fleischküchle"
  ],
  carbonara: [
    "carbonara", "pasta carbonara", "spaghetti carbonara",
    "spaghetti", "pasta"
  ],
  salat: [
    "salat", "gemischter salat", "grüner salat", "beilagensalat"
  ],
  gulasch: [
    "gulasch", "ungarischer gulasch", "rindergulasch", "gulaschsuppe"
  ],
  tomatensuppe: [
    "tomatensuppe", "tomaten suppe", "suppe mit tomaten", "cremesuppe tomaten"
  ]
}

function parseInput(text) {
  const lower = text.toLowerCase().trim()

  // Personenanzahl erkennen
  let persons = 1
  const match = lower.match(/(\d+)\s*(person|personen|leute|portionen|portion)?/)
  if (match) persons = Math.min(Number(match[1]), 20)

  // Gericht erkennen – längste Übereinstimmung gewinnt
  let dish = null
  let bestMatchLength = 0

  for (const [key, keywords] of Object.entries(DISH_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw) && kw.length > bestMatchLength) {
        dish = key
        bestMatchLength = kw.length
      }
    }
  }

  return { dish, persons }
}


// =========================
// AI-ERWEITERUNG (OpenAI via Vercel Proxy)
// =========================

async function aiGenerateRecipe(input) {
  try {
    const response = await fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input })
    })

    if (!response.ok) return null

    const data = await response.json()

    if (!data.ingredients || !Array.isArray(data.ingredients)) return null

    return {
      dishName: data.dishName || input,
      ingredients: data.ingredients
    }

  } catch (err) {
    console.warn("AI nicht verfügbar, Fallback auf lokalen Parser:", err)
    return null
  }
}


// =========================
// ZUTATEN-LOGIK
// =========================

function buildIngredients(recipe, persons, hideBase) {
  return recipe.ingredients
    .filter(i => hideBase ? !i.base : true)
    .map(i => ({
      ...i,
      amount: i.amount ? i.amount * persons : null
    }))
}


// =========================
// ERGEBNIS RENDERN
// =========================

function renderResult(source, persons) {
  // source: либо строка-ключ из recipes.js, либо объект { dishName, ingredients } от AI
  let dishName
  let ingredients

  if (typeof source === "string") {
    // Lokaler Fallback aus recipes.js
    const recipe = recipes[source]
    if (!recipe) return
    dishName = recipe.name
    const hideBase = document.getElementById("toggle-base").checked
    ingredients = buildIngredients(recipe, persons, hideBase)
  } else {
    // AI-Ergebnis
    dishName = source.dishName
    const hideBase = document.getElementById("toggle-base").checked
    ingredients = source.ingredients
      .filter(i => hideBase ? !i.base : true)
      .map(i => ({
        ...i,
        amount: i.amount ? Math.round(i.amount * persons * 10) / 10 : null
      }))
  }

  document.getElementById("dish-name").textContent = dishName

  const list = document.getElementById("ingredients-list")
  const emptyMsg = document.getElementById("empty-msg")
  list.innerHTML = ""

  if (ingredients.length === 0) {
    emptyMsg.classList.remove("hidden")
  } else {
    emptyMsg.classList.add("hidden")
    ingredients.forEach(i => {
      const li = document.createElement("li")
      li.innerHTML = `
        <span class="item-name">${i.name}</span>
        <span class="item-amount">${i.amount ? i.amount + " " + (i.unit || "") : ""}</span>
        <button class="remove-btn">✕</button>
      `
      list.appendChild(li)
    })
  }

  // Entfernen von Elementen
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.target.parentElement.remove()
      if (list.children.length === 0) {
        emptyMsg.classList.remove("hidden")
      }
    })
  })

  // Paywall-Banner nach Nutzungslimit
  increaseUsage()
  if (getUsage() > 5) showPaywallBanner()
}


// =========================
// HAUPTABLAUF
// =========================

function generate() {
  const input = document.getElementById("text-input").value
  if (!input) return

  track("Generate", { query: input })

  localStorage.setItem("lastQuery", input)
  showScreen("screen-loading")

  const texts = [
    "Analysiere Zutaten...",
    "Berechne Mengen...",
    "Erstelle Einkaufsliste..."
  ]

  let i = 0
  const interval = setInterval(() => {
    const el = document.getElementById("loading-text")
    if (el) el.textContent = texts[i % texts.length]
    i++
  }, 500)

  setTimeout(async () => {

    clearInterval(interval)

    const parsed = parseInput(input)
    const aiResult = await aiGenerateRecipe(input)

    if (aiResult) {
      // AI-Ergebnis direkt rendern
      showScreen("screen-result")
      renderResult(aiResult, parsed.persons)
      return
    }

    // Fallback: lokaler Parser
    const dish = parsed.dish

    if (!dish) {
      showScreen("screen-start")
      const inp = document.getElementById("text-input")
      inp.style.borderColor = "red"
      inp.placeholder = "Gericht nicht erkannt – bitte genauer eingeben"
      setTimeout(() => {
        inp.style.borderColor = ""
        inp.placeholder = "z. B. Pasta für 2 Personen"
      }, 3000)
      return
    }

    showScreen("screen-result")
    renderResult(dish, parsed.persons)

  }, 1200)
}


// =========================
// SPRACHEINGABE
// =========================

function initVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  const btn = document.getElementById("voice-btn")

  if (!SpeechRecognition) {
    btn.title = "Spracheingabe nicht unterstützt"
    btn.style.opacity = "0.5"
    return
  }

  const rec = new SpeechRecognition()
  rec.lang = "de-DE"
  rec.interimResults = false

  rec.onstart = () => {
    btn.textContent = "🔴"
    btn.style.animationPlayState = "paused"
  }

  rec.onresult = (e) => {
    const transcript = e.results[0][0].transcript
    document.getElementById("text-input").value = transcript
    btn.textContent = "🎤"
    btn.style.animationPlayState = "running"
    track("Voice Input")
    generate()
  }

  rec.onerror = (e) => {
    console.warn("Speech error:", e.error)
    btn.textContent = "🎤"
    btn.style.animationPlayState = "running"
  }

  rec.onend = () => {
    btn.textContent = "🎤"
    btn.style.animationPlayState = "running"
  }

  btn.onclick = () => {
    rec.start()
  }
}


// =========================
// EVENTS
// =========================

document.getElementById("generate-btn").addEventListener("click", generate)

document.getElementById("back-btn")?.addEventListener("click", () => {
  showScreen("screen-start")
})

document.getElementById("toggle-base").addEventListener("change", () => {
  const input = document.getElementById("text-input").value
  const parsed = parseInput(input)
  // При AI-результате toggle перезапускает generate заново — упрощённо
  if (parsed.dish) renderResult(parsed.dish, parsed.persons)
})

// Weiterleitung zu Supermarkt
document.querySelectorAll(".store-btn-main").forEach(btn => {
  btn.addEventListener("click", () => {
    track("Order Click", { store: btn.dataset.url || "unknown" })
    if (btn.dataset.url) window.open(btn.dataset.url, "_blank")
  })
})


// =========================
// INITIALISIERUNG
// =========================

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
}

initVoice()
showScreen("screen-start")