// =========================
// VERCEL SERVERLESS FUNCTION
// OpenAI API Proxy – schützt den API-Schlüssel
// =========================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Nur POST erlaubt" })
  }

  const { query } = req.body

  if (!query) {
    return res.status(400).json({ error: "Kein Suchbegriff angegeben" })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: "API-Schlüssel nicht konfiguriert" })
  }

  const prompt = `Du bist ein Kochassistent. Der Nutzer möchte folgendes kochen: "${query}".

Gib eine Einkaufsliste als JSON-Array zurück. Jedes Element hat folgende Felder:
- name: Name der Zutat (auf Deutsch)
- amount: Menge pro Person als Zahl (oder null wenn nicht relevant)
- unit: Einheit (g, ml, Stk, EL, TL, etc.) (oder null)
- base: true wenn es eine Basiszutat ist (Salz, Pfeffer, Öl, Butter, etc.), sonst false

Antworte NUR mit dem JSON-Array, ohne Erklärungen, ohne Markdown-Codeblöcke.
Beispiel: [{"name":"Spaghetti","amount":120,"unit":"g","base":false}]

Erkenne auch den Gerichtsnamen und gib ihn als "dishName" zurück.
Format: {"dishName": "...", "ingredients": [...]}`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      const err = await response.json()
      return res.status(502).json({ error: "OpenAI Fehler", details: err })
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()

    // JSON parsen
    const parsed = JSON.parse(content)

    return res.status(200).json(parsed)

  } catch (err) {
    console.error("API Fehler:", err)
    return res.status(500).json({ error: "Interner Fehler", details: err.message })
  }
}
