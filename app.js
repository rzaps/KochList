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

function checkUsage() {
  if (getUsage() >= 5) {
    showScreen("screen-paywall")
    return false
  }
  increaseUsage()
  return true
}


// =========================
// PARSER (einfache Logik statt AI)
// =========================

function parseInput(text) {
  const lower = text.toLowerCase()

  // Personenanzahl erkennen
  let persons = 1
  const match = lower.match(/\d+/)
  if (match) persons = Number(match[0])

  // Gericht erkennen
  let dish = "carbonara" // Standard

  // Pasta Bolognese
  if (lower.includes("bolognese") || 
      (lower.includes("pasta") && lower.includes("hack"))) {
    dish = "bolognese"
  }
  
  // Kartoffelbrot
  else if (lower.includes("kartoffelbrot") || 
           lower.includes("kartoffel")) {
    dish = "kartoffelbrot"
  }
  
  // Zwiebelkuchen
  else if (lower.includes("zwiebelkuchen") || 
           lower.includes("zwiebelkuchen") ||
           (lower.includes("zwiebel") && lower.includes("kuchen"))) {
    dish = "zwiebelkuchen"
  }
  
  // Frikadellen
  else if (lower.includes("frikadelle") || 
           lower.includes("bulette") ||
           (lower.includes("hack") && lower.includes("braten"))) {
    dish = "frikadellen"
  }
  
  // Pasta Carbonara
  else if (lower.includes("carbonara") || 
           (lower.includes("pasta") && lower.includes("ei")) ||
           (lower.includes("spaghetti") && lower.includes("bacon"))) {
    dish = "carbonara"
  }

  return { dish, persons }
}


// =========================
// AI-ERWEITERUNG (VORBEREITET)
// =========================

// Hier kann später eine echte KI (API) integriert werden
async function aiGenerateRecipe(input) {
  console.log("AI called with:", input)
  return null
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

function renderResult(recipeKey, persons) {
  const recipe = recipes[recipeKey]

  if (!recipe) return

  document.getElementById("dish-name").textContent = recipe.name

  const hideBase = document.getElementById("toggle-base").checked

  const list = document.getElementById("ingredients-list")
  list.innerHTML = ""

  const ingredients = buildIngredients(recipe, persons, hideBase)

  ingredients.forEach((i, index) => {
    const li = document.createElement("li")

    li.innerHTML = `
      <span class="item-name">${i.name}</span>
      <span class="item-amount">${i.amount ? i.amount + " " + i.unit : ""}</span>
      <button class="remove-btn">✕</button>
    `

    list.appendChild(li)
  })

  // Entfernen von Elementen
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.target.parentElement.remove()
    })
  })
}


// =========================
// HAUPTABLAUF
// =========================

function generate() {
  if (!checkUsage()) return

  const input = document.getElementById("text-input").value

  if (!input) return

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

    // AI fallback (optional)
    const aiResult = await aiGenerateRecipe(input)

    const dish = aiResult?.dish || parsed.dish
    const persons = parsed.persons

    showScreen("screen-result")
    renderResult(dish, persons)

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
  renderResult(parsed.dish, parsed.persons)
})

document.getElementById("back-home").addEventListener("click", () => {
  showScreen("screen-start")
})

// Weiterleitung zu Supermarkt
document.querySelectorAll(".store-btn-main, .store-btn-secondary").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.url) {
      window.open(btn.dataset.url, "_blank")
    }
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